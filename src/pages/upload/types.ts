export type Stage = "select" | "upload" | "mapping" | "validating" | "results";

export interface DataTemplate {
  id: string;
  label: string;
  description: string;
  frequency: string;
  icon: string;
  columns: ColumnDef[];
  rowCount?: string;
}

export interface ColumnDef {
  field: string;
  type: "text" | "number" | "date" | "enum" | "id";
  required: boolean;
  example: string;
  validation?: string;
}

export interface MappedColumn {
  schemaField: string;
  sourceColumn: string;
  confidence: "high" | "medium" | "manual" | "unmapped";
  sampleValues: string[];
  type: "text" | "number" | "date" | "enum" | "id";
}

export interface ValidationIssue {
  row: number;
  field: string;
  value: string;
  message: string;
  severity: "error" | "warning" | "info";
  ruleCode: string;
}

export interface QualityDimension {
  name: string;
  score: number;
  issueCount: number;
  description: string;
}

export interface RemediationSuggestion {
  row: number;
  field: string;
  currentValue: string;
  suggestedValue: string;
  explanation: string;
}

export interface ValidationResults {
  issues: ValidationIssue[];
  qualityDimensions: QualityDimension[];
  remediations: RemediationSuggestion[];
  totalRows: number;
  summary: string;
}

export interface ParsedFileData {
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
}
