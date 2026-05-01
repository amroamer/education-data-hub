import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, CheckCircle2, AlertTriangle, Info, Zap } from "lucide-react";
import { DataTemplate, MappedColumn } from "./types";
import { SAMPLE_SOURCE_COLUMNS } from "./data";

interface StageMappingProps {
  template: DataTemplate;
  fileName: string;
  onRunValidation: (mapping: MappedColumn[]) => void;
}

const CONFIDENCE_COLORS = {
  high: { badge: "badge-success", label: "Auto-matched" },
  medium: { badge: "badge-warning", label: "Suggest" },
  manual: { badge: "badge-error", label: "Review" },
  unmapped: { badge: "badge-pending", label: "Unmapped" },
};

const buildInitialMapping = (template: DataTemplate): MappedColumn[] => {
  const sourceCols = SAMPLE_SOURCE_COLUMNS[template.id] || [];
  return template.columns.map((col, i) => {
    const confidence = i < Math.floor(template.columns.length * 0.6)
      ? "high"
      : i < Math.floor(template.columns.length * 0.8)
      ? "medium"
      : "manual";
    return {
      schemaField: col.field,
      sourceColumn: sourceCols[i] || (confidence === "manual" ? "" : sourceCols[i % sourceCols.length]),
      confidence,
      sampleValues: getSampleValues(col.field, i),
      type: col.type,
    };
  });
};

function getSampleValues(field: string, i: number): string[] {
  const samples: Record<string, string[]> = {
    "Student ID": ["STU-001234", "STU-001235", "STU-001236"],
    "Full Name": ["Ahmed Al-Mansouri", "Fatima Hassan", "James Wilson"],
    "Gender": ["M", "F", "M"],
    "Date of Birth": ["2010-04-15", "2009-11-02", "2008-06-30"],
    "Nationality": ["ARE", "IND", "GBR"],
    "Grade Level": ["Grade 7", "Grade 7", "Grade 8"],
    "Enrollment Date": ["2024-09-01", "2024-09-01", "2023-09-01"],
    "School ID": ["SCH-0042", "SCH-0042", "SCH-0042"],
  };
  return samples[field] || [`Value ${i}-1`, `Value ${i}-2`, `Value ${i}-3`];
}

export const StageMapping = ({ template, fileName, onRunValidation }: StageMappingProps) => {
  const [mapping, setMapping] = useState<MappedColumn[]>(() => buildInitialMapping(template));
  const sourceCols = SAMPLE_SOURCE_COLUMNS[template.id] || [];

  const autoMatched = mapping.filter(m => m.confidence === "high").length;
  const needsReview = mapping.filter(m => m.confidence === "manual" || m.confidence === "unmapped").length;

  const updateMapping = (schemaField: string, sourceColumn: string) => {
    setMapping(prev => prev.map(m =>
      m.schemaField === schemaField
        ? { ...m, sourceColumn, confidence: sourceColumn ? "medium" : "unmapped" }
        : m
    ));
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Summary bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(152 55% 92%)" }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(var(--success))" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">File uploaded: <span className="font-mono">{fileName}</span></div>
          <div className="text-xs text-muted-foreground">
            {template.columns.length} schema fields · {sourceCols.length} source columns detected · 1,284 rows
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{autoMatched}</div>
            <div className="text-[10px] text-muted-foreground">Auto-matched</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: needsReview > 0 ? "hsl(var(--warning))" : "hsl(var(--success))" }}>
              {needsReview}
            </div>
            <div className="text-[10px] text-muted-foreground">Needs review</div>
          </div>
        </div>
      </div>

      {/* AI match notice */}
      {autoMatched > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border"
          style={{ background: "hsl(224 100% 97%)", borderColor: "hsl(224 100% 88%)" }}>
          <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(224 100% 38%)" }} />
          <span className="text-xs" style={{ color: "hsl(224 100% 30%)" }}>
            <strong>{autoMatched} columns auto-matched</strong> using header similarity and data type inference. Review manually-flagged fields below.
          </span>
        </div>
      )}

      {/* Mapping Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="grid grid-cols-12 gap-0 px-4 py-2.5 border-b border-border"
          style={{ background: "hsl(236 25% 97%)" }}>
          {[
            { label: "Schema Field", span: "col-span-3" },
            { label: "Type / Required", span: "col-span-2" },
            { label: "Your Column", span: "col-span-3" },
            { label: "Sample Values (first 3 rows)", span: "col-span-3" },
            { label: "Match", span: "col-span-1" },
          ].map(h => (
            <div key={h.label} className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", h.span)}>
              {h.label}
            </div>
          ))}
        </div>

        {mapping.map((row) => {
          const schemaCol = template.columns.find(c => c.field === row.schemaField)!;
          const conf = CONFIDENCE_COLORS[row.confidence];
          return (
            <div key={row.schemaField}
              className={cn(
                "grid grid-cols-12 gap-0 px-4 py-3 border-b border-border items-center transition-colors",
                "hover:bg-muted/30",
                row.confidence === "manual" && "bg-warning/5",
              )}
              style={row.confidence === "manual" ? { background: "hsl(340 56% 40% / 0.04)" } : {}}>

              <div className="col-span-3 pr-3">
                <div className="flex items-center gap-1.5">
                  {schemaCol.required
                    ? <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "hsl(var(--error))" }} />
                    : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />}
                  <span className="text-xs font-semibold text-foreground">{row.schemaField}</span>
                </div>
                {schemaCol.validation && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 pl-3">{schemaCol.validation}</div>
                )}
              </div>

              <div className="col-span-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize w-fit"
                    style={{ background: "hsl(236 25% 93%)", color: "hsl(214 18% 40%)" }}>
                    {schemaCol.type}
                  </span>
                  {schemaCol.required
                    ? <span className="text-[10px] font-medium" style={{ color: "hsl(var(--error))" }}>Required</span>
                    : <span className="text-[10px] text-muted-foreground/60">Optional</span>}
                </div>
              </div>

              <div className="col-span-3 pr-3">
                <div className="relative">
                  <select
                    value={row.sourceColumn}
                    onChange={(e) => updateMapping(row.schemaField, e.target.value)}
                    className={cn(
                      "w-full text-xs px-2.5 py-1.5 pr-7 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none",
                      row.confidence === "manual" && "border-warning",
                    )}
                    style={row.confidence === "manual" ? { borderColor: "hsl(var(--warning))" } : {}}
                  >
                    <option value="">— Select column —</option>
                    {sourceCols.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="col-span-3 pr-3">
                <div className="flex flex-col gap-0.5">
                  {row.sampleValues.slice(0, 2).map((v, vi) => (
                    <span key={vi} className="text-[10px] font-mono text-muted-foreground truncate">{v}</span>
                  ))}
                </div>
              </div>

              <div className="col-span-1">
                <span className={conf.badge}>{conf.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Columns marked <strong className="text-foreground">Review</strong> must be manually mapped before validation can run. Optional fields can be left unmapped.</span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-muted-foreground">
          {needsReview > 0
            ? <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(var(--warning))" }} /> {needsReview} field(s) need review</span>
            : <span className="flex items-center gap-1.5 text-success"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--success))" }} /> All fields mapped</span>}
        </div>
        <button
          onClick={() => onRunValidation(mapping)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          Run Validation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
