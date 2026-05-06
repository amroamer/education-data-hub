import { ollamaGenerate, extractJSON } from "@/lib/ollama";
import type {
  DataTemplate,
  MappedColumn,
  ValidationIssue,
  QualityDimension,
  RemediationSuggestion,
  ColumnDef,
} from "@/pages/upload/types";

export interface ValidationAgentResult {
  issues: ValidationIssue[];
  qualityDimensions: QualityDimension[];
  remediations: RemediationSuggestion[];
  totalRows: number;
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Maps real file rows from source column names to schema field names
 * using the column mapping, and limits to a sample for the LLM prompt.
 */
function mapRealRows(
  fileRows: Record<string, string>[],
  mapping: MappedColumn[],
  maxRows: number = 20,
): Record<string, string>[] {
  const sampleSize = Math.min(fileRows.length, maxRows);
  const rows: Record<string, string>[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const row: Record<string, string> = {};
    for (const m of mapping) {
      if (m.sourceColumn) {
        row[m.schemaField] = fileRows[i][m.sourceColumn] ?? "";
      } else {
        row[m.schemaField] = "";
      }
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Build a deterministic rules table from template column definitions.
 * This is the SINGLE SOURCE OF TRUTH for both rule-based and LLM validation.
 */
function buildRulesTable(template: DataTemplate): string {
  const lines: string[] = [];
  for (const col of template.columns) {
    const rules = col.rules ?? [];
    if (rules.length === 0 && !col.required) continue;

    lines.push(`\n### Field: "${col.field}" (type: ${col.type}, required: ${col.required})`);

    if (col.required) {
      lines.push(`  - [REQ-001] ERROR: Field must not be empty.`);
    }

    for (const r of rules) {
      const severity = r.severity.toUpperCase();
      let detail = `  - [${r.code}] ${severity}: ${r.description}`;

      if (r.pattern) detail += ` | regex: ${r.pattern}`;
      if (r.allowedValues) detail += ` | allowed: [${r.allowedValues.join(", ")}]`;
      if (r.min !== undefined || r.max !== undefined) {
        const parts: string[] = [];
        if (r.min !== undefined) parts.push(`min=${r.min}`);
        if (r.max !== undefined) parts.push(`max=${r.max}`);
        detail += ` | range: ${parts.join(", ")}`;
      }
      if (r.maxLength) detail += ` | maxLength: ${r.maxLength}`;
      if (r.unique) detail += ` | unique: true`;
      if (r.dateConstraint) detail += ` | dateConstraint: ${r.dateConstraint}`;

      lines.push(detail);
    }
  }
  return lines.join("\n");
}

function sanitizeIssues(raw: ValidationIssue[]): ValidationIssue[] {
  return raw
    .filter((i) => i.row !== undefined && i.field && i.message && i.severity && i.ruleCode)
    .map((i) => ({
      row: Number(i.row),
      field: String(i.field),
      value: String(i.value ?? ""),
      message: String(i.message),
      severity: (["error", "warning", "info"] as const).includes(i.severity)
        ? i.severity
        : "warning",
      ruleCode: String(i.ruleCode),
    }));
}

function sanitizeDimensions(
  raw: QualityDimension[],
  issues: ValidationIssue[],
): QualityDimension[] {
  if (raw.length === 6) {
    return raw.map((d) => ({
      name: String(d.name),
      score: Math.max(0, Math.min(100, Number(d.score))),
      issueCount: Math.max(0, Number(d.issueCount)),
      description: String(d.description),
    }));
  }

  // Fallback: compute from issues
  const reqIssues = issues.filter((i) => i.ruleCode.startsWith("REQ")).length;
  const fmtIssues = issues.filter((i) =>
    ["ID", "DATE", "ENUM"].some((p) => i.ruleCode.startsWith(p)),
  ).length;
  const refIssues = issues.filter((i) => i.ruleCode.startsWith("REF")).length;
  const bizIssues = issues.filter((i) => i.ruleCode.startsWith("BIZ")).length;

  return [
    { name: "Completeness", score: Math.max(50, 100 - reqIssues * 3), issueCount: reqIssues, description: "Required fields are populated" },
    { name: "Accuracy", score: Math.max(50, 100 - fmtIssues * 2), issueCount: fmtIssues, description: "Values conform to expected formats" },
    { name: "Consistency", score: Math.max(70, 100 - bizIssues * 2), issueCount: bizIssues, description: "Cross-field logic is coherent" },
    { name: "Timeliness", score: 99, issueCount: 0, description: "Dates are within expected ranges" },
    { name: "Uniqueness", score: 100, issueCount: 0, description: "No duplicate records found" },
    { name: "Referential Integrity", score: Math.max(60, 100 - refIssues * 5), issueCount: refIssues, description: "IDs match KHDA registered entities" },
  ];
}

/* ------------------------------------------------------------------ */
/*  Rule-based validation (deterministic, no LLM)                      */
/* ------------------------------------------------------------------ */

function checkDateValid(val: string): { valid: boolean; month?: number; day?: number } {
  const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return { valid: false };
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return { valid: false, month, day };
  return { valid: true, month, day };
}

export function runRuleBasedValidation(
  template: DataTemplate,
  mapping: MappedColumn[],
  totalRows: number,
  fileRows?: Record<string, string>[],
): ValidationAgentResult {
  const issues: ValidationIssue[] = [];
  const remediations: RemediationSuggestion[] = [];

  if (!fileRows || fileRows.length === 0) {
    return {
      issues: [],
      qualityDimensions: sanitizeDimensions([], []),
      remediations: [],
      totalRows,
      summary: "No data rows available for validation.",
    };
  }

  const mappedRows = mapRealRows(fileRows, mapping, fileRows.length);
  const colDefs = new Map<string, ColumnDef>(template.columns.map(c => [c.field, c]));
  const seenIds = new Map<string, Set<string>>();

  for (let i = 0; i < mappedRows.length; i++) {
    const row = mappedRows[i];
    const rowNum = i + 1;

    for (const m of mapping) {
      if (!m.sourceColumn) continue;
      const col = colDefs.get(m.schemaField);
      if (!col) continue;
      const val = (row[m.schemaField] ?? "").trim();

      // Required check
      if (col.required && val === "") {
        issues.push({ row: rowNum, field: m.schemaField, value: "", message: `Required field "${m.schemaField}" is empty`, severity: "error", ruleCode: "REQ-001" });
        continue;
      }
      if (val === "") continue;

      // Apply each structured rule
      for (const rule of (col.rules ?? [])) {
        // Pattern check
        if (rule.pattern) {
          const re = new RegExp(rule.pattern);
          if (!re.test(val)) {
            issues.push({ row: rowNum, field: m.schemaField, value: val, message: rule.description, severity: rule.severity, ruleCode: rule.code });
            if (rule.idPrefix) {
              remediations.push({ row: rowNum, field: m.schemaField, currentValue: val, suggestedValue: "", explanation: rule.description });
            }
            continue; // skip other checks for this rule if pattern fails
          }
        }

        // Allowed values (enum)
        if (rule.allowedValues && rule.allowedValues.length > 0) {
          const lower = val.toLowerCase();
          const match = rule.allowedValues.some(a => a.toLowerCase() === lower);
          if (!match) {
            issues.push({ row: rowNum, field: m.schemaField, value: val, message: `Value "${val}" not allowed — ${rule.description}`, severity: rule.severity, ruleCode: rule.code });
            remediations.push({ row: rowNum, field: m.schemaField, currentValue: val, suggestedValue: "", explanation: `Expected one of: ${rule.allowedValues.join(", ")}` });
          }
        }

        // Number range
        if (rule.min !== undefined || rule.max !== undefined) {
          const num = Number(val);
          if (isNaN(num)) {
            issues.push({ row: rowNum, field: m.schemaField, value: val, message: `Expected a number but found "${val}"`, severity: "error", ruleCode: rule.code });
          } else {
            if (rule.min !== undefined && num < rule.min) {
              issues.push({ row: rowNum, field: m.schemaField, value: val, message: `Value ${num} is below minimum ${rule.min}`, severity: rule.severity, ruleCode: rule.code });
            }
            if (rule.max !== undefined && num > rule.max) {
              issues.push({ row: rowNum, field: m.schemaField, value: val, message: `Value ${num} exceeds maximum ${rule.max}`, severity: rule.severity, ruleCode: rule.code });
            }
          }
        }

        // Max length (text)
        if (rule.maxLength && val.length > rule.maxLength) {
          issues.push({ row: rowNum, field: m.schemaField, value: val.substring(0, 30) + "...", message: `Text exceeds ${rule.maxLength} character limit (found ${val.length})`, severity: rule.severity, ruleCode: rule.code });
        }

        // Unique check
        if (rule.unique) {
          if (!seenIds.has(m.schemaField)) seenIds.set(m.schemaField, new Set());
          const idSet = seenIds.get(m.schemaField)!;
          if (idSet.has(val)) {
            issues.push({ row: rowNum, field: m.schemaField, value: val, message: `Duplicate value "${val}" found`, severity: rule.severity, ruleCode: rule.code });
          }
          idSet.add(val);
        }

        // Date constraint
        if (rule.dateConstraint) {
          const d = checkDateValid(val);
          if (d.valid) {
            const date = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (rule.dateConstraint === "past" && date >= today) {
              issues.push({ row: rowNum, field: m.schemaField, value: val, message: rule.description, severity: rule.severity, ruleCode: rule.code });
            }
            if (rule.dateConstraint === "pastOrToday" && date > today) {
              issues.push({ row: rowNum, field: m.schemaField, value: val, message: rule.description, severity: rule.severity, ruleCode: rule.code });
            }
            if (rule.dateConstraint === "future" && date <= today) {
              issues.push({ row: rowNum, field: m.schemaField, value: val, message: rule.description, severity: rule.severity, ruleCode: rule.code });
            }
          }
        }
      }

      // Date format validity (applies to all date columns even without explicit pattern)
      if (col.type === "date" && !col.rules?.some(r => r.pattern)) {
        const d = checkDateValid(val);
        if (!d.valid) {
          issues.push({ row: rowNum, field: m.schemaField, value: val, message: `Invalid date format "${val}" — expected M/D/YYYY`, severity: "error", ruleCode: "DATE-001" });
        }
      }
    }

    // Unmapped required fields (report once)
    if (i === 0) {
      for (const m of mapping) {
        if (m.sourceColumn) continue;
        const col = colDefs.get(m.schemaField);
        if (col?.required) {
          issues.push({ row: 0, field: m.schemaField, value: "", message: `Required field "${m.schemaField}" is not mapped to any source column`, severity: "error", ruleCode: "REQ-002" });
        }
      }
    }
  }

  const qualityDimensions = sanitizeDimensions([], issues);
  const errors = issues.filter(i => i.severity === "error").length;
  const warnings = issues.filter(i => i.severity === "warning").length;

  return {
    issues,
    qualityDimensions,
    remediations,
    totalRows,
    summary: `Rule-based analysis of ${totalRows} records found ${errors} error(s) and ${warnings} warning(s).`,
  };
}

/* ------------------------------------------------------------------ */
/*  LLM-powered validation (uses the SAME rules table as above)        */
/* ------------------------------------------------------------------ */

function buildValidationPrompt(
  template: DataTemplate,
  mapping: MappedColumn[],
  sampleRows: Record<string, string>[],
  totalRows: number,
): string {
  const rulesTable = buildRulesTable(template);

  return `You are a data quality validation specialist for KHDA education regulatory data (Dubai).

## Schema: ${template.label}

## VALIDATION RULES (MANDATORY — you MUST apply exactly these rules, no more, no fewer)
${rulesTable}

## Sample Data (${sampleRows.length} of ${totalRows} rows)
${sampleRows.map((row, i) => `Row ${i + 1}: ${JSON.stringify(row)}`).join("\n")}

## Column Mapping
${mapping
  .filter((m) => m.sourceColumn)
  .map((m) => `- "${m.schemaField}" <- "${m.sourceColumn}" (confidence: ${m.confidence})`)
  .join("\n")}

## CRITICAL INSTRUCTIONS
1. You MUST validate EVERY sample row against EVERY rule listed above. Do NOT invent new rules.
2. Use the EXACT rule codes from the rules table (e.g. ID-001, DATE-001, ENUM-001, REQ-001, BIZ-001).
3. Use the EXACT severity from the rules table (ERROR or WARNING). Do NOT change severity.
4. For each violated rule, report the exact row number, field name, value found, and the rule description.
5. If a required field is empty, report it as REQ-001 with severity "error".
6. If a value does not match the regex pattern, report the specific rule code.
7. If an enum value is not in the allowed list, report it as the rule code from the table.
8. Given ${totalRows} total rows, estimate realistic quality scores based on the sample issues found.
9. For each issue, suggest a fix in the remediations array.

Respond with ONLY this JSON structure:
\`\`\`json
{
  "issues": [
    { "row": <number>, "field": "<field name>", "value": "<actual value>", "message": "<rule description>", "severity": "error"|"warning"|"info", "ruleCode": "<from rules table>" }
  ],
  "qualityDimensions": [
    { "name": "Completeness", "score": <0-100>, "issueCount": <n>, "description": "Required fields are populated" },
    { "name": "Accuracy", "score": <0-100>, "issueCount": <n>, "description": "Values conform to expected formats" },
    { "name": "Consistency", "score": <0-100>, "issueCount": <n>, "description": "Cross-field logic is coherent" },
    { "name": "Timeliness", "score": <0-100>, "issueCount": <n>, "description": "Dates are within expected ranges" },
    { "name": "Uniqueness", "score": <0-100>, "issueCount": <n>, "description": "No duplicate records found" },
    { "name": "Referential Integrity", "score": <0-100>, "issueCount": <n>, "description": "IDs match KHDA registered entities" }
  ],
  "remediations": [
    { "row": <number>, "field": "<field>", "currentValue": "<bad value>", "suggestedValue": "<fixed value>", "explanation": "<why>" }
  ],
  "summary": "<1-2 sentence summary of findings>"
}
\`\`\`

IMPORTANT: Only report issues for rules listed above. Do NOT fabricate rules. Use the EXACT rule codes.`;
}

export async function runValidationAgent(
  model: string,
  template: DataTemplate,
  mapping: MappedColumn[],
  totalRows: number,
  fileRows?: Record<string, string>[],
): Promise<ValidationAgentResult> {
  const sampleRows = fileRows ? mapRealRows(fileRows, mapping) : [];
  const prompt = buildValidationPrompt(template, mapping, sampleRows, totalRows);

  const rawResponse = await ollamaGenerate({
    model,
    prompt,
    temperature: 0.1, // Very low temperature for deterministic rule application
    timeout: 90_000,
  });

  const parsed = extractJSON<{
    issues: ValidationIssue[];
    qualityDimensions: QualityDimension[];
    remediations: RemediationSuggestion[];
    summary: string;
  }>(rawResponse);

  if (!parsed || !Array.isArray(parsed.issues)) {
    throw new Error("Failed to parse validation agent response");
  }

  const issues = sanitizeIssues(parsed.issues);
  const qualityDimensions = sanitizeDimensions(
    parsed.qualityDimensions || [],
    issues,
  );
  const remediations: RemediationSuggestion[] = (
    parsed.remediations || []
  ).map((r) => ({
    row: Number(r.row),
    field: String(r.field),
    currentValue: String(r.currentValue ?? ""),
    suggestedValue: String(r.suggestedValue ?? ""),
    explanation: String(r.explanation ?? ""),
  }));

  return {
    issues,
    qualityDimensions,
    remediations,
    totalRows,
    summary: parsed.summary || "",
  };
}
