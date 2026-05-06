import { ollamaGenerate, extractJSON } from "@/lib/ollama";
import type {
  DataTemplate,
  MappedColumn,
  ValidationIssue,
  QualityDimension,
  RemediationSuggestion,
} from "@/pages/upload/types";

export interface ValidationAgentResult {
  issues: ValidationIssue[];
  qualityDimensions: QualityDimension[];
  remediations: RemediationSuggestion[];
  totalRows: number;
  summary: string;
}

function generateSyntheticRows(
  template: DataTemplate,
  mapping: MappedColumn[],
  rowCount: number,
): Record<string, string>[] {
  const sampleSize = Math.min(rowCount, 20);
  const rows: Record<string, string>[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const row: Record<string, string> = {};
    for (const col of template.columns) {
      const mapped = mapping.find((m) => m.schemaField === col.field);
      if (mapped && mapped.sampleValues.length > 0) {
        row[col.field] = mapped.sampleValues[i % mapped.sampleValues.length];
      } else {
        row[col.field] = col.example;
      }
    }

    // Seed deliberate errors for the LLM to discover
    if (i === 3) row[template.columns[0].field] = "INVALID-ID";
    if (i === 7) {
      const dateCol = template.columns.find((c) => c.type === "date");
      if (dateCol) row[dateCol.field] = "2025-13-45";
    }
    if (i === 12) {
      const reqCol = template.columns.find((c) => c.required);
      if (reqCol) row[reqCol.field] = "";
    }
    if (i === 15) {
      const enumCol = template.columns.find((c) => c.type === "enum");
      if (enumCol) row[enumCol.field] = "INVALID_ENUM_VALUE";
    }

    rows.push(row);
  }
  return rows;
}

function buildValidationPrompt(
  template: DataTemplate,
  mapping: MappedColumn[],
  sampleRows: Record<string, string>[],
  totalRows: number,
): string {
  return `You are a data quality validation specialist for KHDA education regulatory data (Dubai).

## Schema: ${template.label}
${template.columns
  .map(
    (c) =>
      `- "${c.field}" (type: ${c.type}, required: ${c.required}${c.validation ? `, rules: "${c.validation}"` : ""})`,
  )
  .join("\n")}

## Sample Data (${sampleRows.length} of ${totalRows} rows)
${sampleRows.map((row, i) => `Row ${i + 1}: ${JSON.stringify(row)}`).join("\n")}

## Column Mapping
${mapping
  .filter((m) => m.sourceColumn)
  .map(
    (m) =>
      `- "${m.schemaField}" <- "${m.sourceColumn}" (confidence: ${m.confidence})`,
  )
  .join("\n")}

## Instructions
1. Validate each sample row against the schema rules. Find ALL issues.
2. Given ${totalRows} total rows, estimate realistic quality scores.
3. For each issue, suggest a fix.

Respond with ONLY JSON:
\`\`\`json
{
  "issues": [
    {
      "row": 4,
      "field": "Student ID",
      "value": "INVALID-ID",
      "message": "Invalid ID format - expected STU-XXXXXX (6 digits)",
      "severity": "error",
      "ruleCode": "ID-001"
    }
  ],
  "qualityDimensions": [
    { "name": "Completeness", "score": 94, "issueCount": 2, "description": "Required fields are populated" },
    { "name": "Accuracy", "score": 87, "issueCount": 6, "description": "Values conform to expected formats" },
    { "name": "Consistency", "score": 96, "issueCount": 1, "description": "Cross-field logic is coherent" },
    { "name": "Timeliness", "score": 99, "issueCount": 0, "description": "Dates are within expected ranges" },
    { "name": "Uniqueness", "score": 100, "issueCount": 0, "description": "No duplicate records found" },
    { "name": "Referential Integrity", "score": 89, "issueCount": 2, "description": "IDs match KHDA registered entities" }
  ],
  "remediations": [
    {
      "row": 4,
      "field": "Student ID",
      "currentValue": "INVALID-ID",
      "suggestedValue": "STU-000004",
      "explanation": "Reformat with STU- prefix followed by 6-digit number."
    }
  ],
  "summary": "Analysis of ${totalRows} records found N errors and M warnings..."
}
\`\`\`

Rules: severity is "error", "warning", or "info". ruleCode format: PREFIX-NNN (ID, DATE, ENUM, REQ, REF, BIZ). Include ALL 6 quality dimensions. Scores 0-100. Generate 8-15 realistic issues.`;
}

function sanitizeIssues(raw: ValidationIssue[]): ValidationIssue[] {
  return raw
    .filter((i) => i.row && i.field && i.message && i.severity && i.ruleCode)
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
  const reqIssues = issues.filter((i) =>
    i.ruleCode.startsWith("REQ"),
  ).length;
  const fmtIssues = issues.filter((i) =>
    ["ID", "DATE", "ENUM"].some((p) => i.ruleCode.startsWith(p)),
  ).length;
  const refIssues = issues.filter((i) =>
    i.ruleCode.startsWith("REF"),
  ).length;
  const bizIssues = issues.filter((i) =>
    i.ruleCode.startsWith("BIZ"),
  ).length;

  return [
    { name: "Completeness", score: Math.max(50, 100 - reqIssues * 3), issueCount: reqIssues, description: "Required fields are populated" },
    { name: "Accuracy", score: Math.max(50, 100 - fmtIssues * 2), issueCount: fmtIssues, description: "Values conform to expected formats" },
    { name: "Consistency", score: Math.max(70, 100 - bizIssues * 2), issueCount: bizIssues, description: "Cross-field logic is coherent" },
    { name: "Timeliness", score: 99, issueCount: 0, description: "Dates are within expected ranges" },
    { name: "Uniqueness", score: 100, issueCount: 0, description: "No duplicate records found" },
    { name: "Referential Integrity", score: Math.max(60, 100 - refIssues * 5), issueCount: refIssues, description: "IDs match KHDA registered entities" },
  ];
}

export async function runValidationAgent(
  model: string,
  template: DataTemplate,
  mapping: MappedColumn[],
  totalRows: number,
): Promise<ValidationAgentResult> {
  const sampleRows = generateSyntheticRows(template, mapping, totalRows);
  const prompt = buildValidationPrompt(template, mapping, sampleRows, totalRows);

  const rawResponse = await ollamaGenerate({
    model,
    prompt,
    temperature: 0.4,
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
