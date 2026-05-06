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

/** Machine-readable validation rule applied to a single field. */
export interface FieldRule {
  /** Rule identifier — must match ruleCode in ValidationIssue. */
  code: string;
  /** Severity when the rule is violated. */
  severity: "error" | "warning" | "info";
  /** Human-readable description shown in the template & used by the LLM. */
  description: string;
  /** Optional regex pattern (as a string) the value must match. */
  pattern?: string;
  /** For enum fields: the exhaustive list of allowed values (case-insensitive). */
  allowedValues?: string[];
  /** For number fields: inclusive minimum. */
  min?: number;
  /** For number fields: inclusive maximum. */
  max?: number;
  /** For text fields: maximum character length. */
  maxLength?: number;
  /** For id fields: expected prefix (e.g. "STU-"). */
  idPrefix?: string;
  /** For id fields: expected digit count after the prefix. */
  idDigits?: number;
  /** If true, values must be unique across the entire dataset for this field. */
  unique?: boolean;
  /** "future" = must be in the future, "past" = must be in the past, "pastOrToday" = must be today or earlier. */
  dateConstraint?: "future" | "past" | "pastOrToday";
}

export interface ColumnDef {
  field: string;
  type: "text" | "number" | "date" | "enum" | "id";
  required: boolean;
  example: string;
  /** Human-readable validation summary (shown in schema reference sheet). */
  validation?: string;
  /** Machine-readable rules — the single source of truth for validation. */
  rules?: FieldRule[];
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
  allRows: Record<string, string>[];
  totalRows: number;
}
