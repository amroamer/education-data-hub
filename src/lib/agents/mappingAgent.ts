import { ollamaGenerate, extractJSON } from "@/lib/ollama";
import type { DataTemplate, MappedColumn, ColumnDef } from "@/pages/upload/types";

export interface MappingAgentResult {
  mappings: MappedColumn[];
  reasoning: Record<string, string>;
}

function buildMappingPrompt(
  schemaColumns: ColumnDef[],
  sourceColumns: string[],
  sampleData: Record<string, string[]>,
): string {
  return `You are a strict data column mapping specialist. Your job is to match source columns to a target schema ONLY when there is a genuine semantic match.

## Target Schema (what the data SHOULD look like)
${schemaColumns.map((c) => `- "${c.field}" (type: ${c.type}, required: ${c.required}, example: "${c.example}"${c.validation ? `, validation: "${c.validation}"` : ""})`).join("\n")}

## Source Columns (from the uploaded file)
${sourceColumns
  .map((c) => {
    const samples = sampleData[c];
    return `- "${c}"${samples ? ` — sample values: [${samples.map((s) => `"${s}"`).join(", ")}]` : ""}`;
  })
  .join("\n")}

## CRITICAL RULES — read carefully
1. ONLY match columns that genuinely represent the same concept. "HS Code" is NOT a "Student ID". "Country of Origin" is NOT a "Nationality" for a student. Do NOT force-match unrelated columns.
2. If the uploaded file is from a completely different domain (e.g., trade data uploaded against a student enrollment schema), MOST or ALL fields should be "manual" with sourceColumn "". This is the correct behavior.
3. Matching requires BOTH semantic meaning AND data format compatibility. A date column in trade data does not match "Date of Birth" just because both are dates.
4. When in doubt, leave it unmapped (confidence: "manual", sourceColumn: ""). False matches are much worse than missing matches.
5. Type compatibility alone is NEVER sufficient. "Country of Destination" and "Enrollment Date" are both text/date but represent completely different things.

## Confidence levels
- "high": The source column clearly represents the SAME concept as the schema field (matching name AND meaning AND compatible values). Example: "student_id" → "Student ID" with values like "STU-001234".
- "medium": Likely the same concept but name is different or values need review. Example: "sex" → "Gender" with values "M"/"F".
- "manual": No matching source column found, OR the match is a stretch. Set sourceColumn to "". This is the DEFAULT — use this unless you are confident.

Respond with ONLY a JSON object:
\`\`\`json
{
  "mappings": [
    {
      "schemaField": "Student ID",
      "sourceColumn": "student_id",
      "confidence": "high",
      "reasoning": "Column name directly corresponds and sample values match STU-XXXXXX format."
    },
    {
      "schemaField": "Grade Level",
      "sourceColumn": "",
      "confidence": "manual",
      "reasoning": "No source column represents student grade level."
    }
  ]
}
\`\`\`

Include ALL ${schemaColumns.length} schema fields. Do not reuse the same source column for multiple fields. It is perfectly fine — and expected — for many or all fields to be unmapped if the file does not match the schema.`;
}

export async function runMappingAgent(
  model: string,
  template: DataTemplate,
  sourceColumns: string[],
  sampleData: Record<string, string[]>,
): Promise<MappingAgentResult> {
  const prompt = buildMappingPrompt(
    template.columns,
    sourceColumns,
    sampleData,
  );

  const rawResponse = await ollamaGenerate({
    model,
    prompt,
    temperature: 0.2,
  });

  const parsed = extractJSON<{
    mappings: Array<{
      schemaField: string;
      sourceColumn: string;
      confidence: string;
      reasoning: string;
    }>;
  }>(rawResponse);

  if (!parsed || !Array.isArray(parsed.mappings)) {
    throw new Error("Failed to parse mapping agent response");
  }

  const reasoning: Record<string, string> = {};
  const usedSourceCols = new Set<string>();

  const mappings: MappedColumn[] = template.columns.map((col) => {
    const match = parsed.mappings.find((m) => m.schemaField === col.field);

    if (match && match.sourceColumn && !usedSourceCols.has(match.sourceColumn)) {
      usedSourceCols.add(match.sourceColumn);
      reasoning[col.field] = match.reasoning || "";

      const validConfidence = ["high", "medium", "manual"] as const;
      const conf = validConfidence.includes(
        match.confidence as (typeof validConfidence)[number],
      )
        ? (match.confidence as "high" | "medium" | "manual")
        : "manual";

      return {
        schemaField: col.field,
        sourceColumn: match.sourceColumn,
        confidence: conf,
        sampleValues: sampleData[match.sourceColumn] || [],
        type: col.type,
      };
    }

    // Store reasoning even for unmapped fields
    if (match?.reasoning) {
      reasoning[col.field] = match.reasoning;
    } else {
      reasoning[col.field] = `No matching source column found for "${col.field}".`;
    }

    return {
      schemaField: col.field,
      sourceColumn: "",
      confidence: "unmapped" as const,
      sampleValues: [],
      type: col.type,
    };
  });

  return { mappings, reasoning };
}
