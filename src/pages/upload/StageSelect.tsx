import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Info, ArrowRight, Download, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { DataTemplate } from "./types";
import { DATA_TEMPLATES } from "./data";
import * as XLSX from "xlsx";

interface StageSelectProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  onNext: () => void;
}

export const StageSelect = ({ selectedTemplate, onSelectTemplate, onNext }: StageSelectProps) => {
  const template = DATA_TEMPLATES.find(t => t.id === selectedTemplate)!;

  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Data — headers + 2 example rows
    const headers = template.columns.map(c => c.field);
    const exampleRow = template.columns.map(c => c.example);
    const emptyRow = template.columns.map(() => "");
    const dataSheet = XLSX.utils.aoa_to_sheet([headers, exampleRow, emptyRow]);

    // Set column widths based on header/example length
    dataSheet["!cols"] = template.columns.map(c => ({
      wch: Math.max(c.field.length, c.example.length, 14) + 2,
    }));
    XLSX.utils.book_append_sheet(wb, dataSheet, "Data");

    // Sheet 2: Schema Reference — field details
    const schemaHeaders = ["Field Name", "Type", "Required", "Validation Rule", "Example Value"];
    const schemaRows = template.columns.map(c => [
      c.field,
      c.type,
      c.required ? "Yes" : "No",
      c.validation ?? "",
      c.example,
    ]);
    const schemaSheet = XLSX.utils.aoa_to_sheet([schemaHeaders, ...schemaRows]);
    schemaSheet["!cols"] = [
      { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, schemaSheet, "Schema Reference");

    // Sheet 3: Validation Rules — detailed machine-enforced rules
    const rulesHeaders = ["Field", "Rule Code", "Severity", "Description", "Pattern / Allowed Values", "Constraints"];
    const rulesRows: (string | number)[][] = [];
    for (const col of template.columns) {
      // Required rule
      if (col.required) {
        rulesRows.push([col.field, "REQ-001", "ERROR", "Field must not be empty", "", "required"]);
      }
      // Structured rules
      for (const r of (col.rules ?? [])) {
        const patternOrValues = r.allowedValues
          ? r.allowedValues.join(", ")
          : r.pattern ?? "";
        const constraints: string[] = [];
        if (r.min !== undefined) constraints.push(`min=${r.min}`);
        if (r.max !== undefined) constraints.push(`max=${r.max}`);
        if (r.maxLength) constraints.push(`maxLength=${r.maxLength}`);
        if (r.unique) constraints.push("unique");
        if (r.dateConstraint) constraints.push(`date: ${r.dateConstraint}`);
        if (r.idPrefix) constraints.push(`prefix=${r.idPrefix}`);
        if (r.idDigits) constraints.push(`digits=${r.idDigits}`);
        rulesRows.push([
          col.field,
          r.code,
          r.severity.toUpperCase(),
          r.description,
          patternOrValues,
          constraints.join(", "),
        ]);
      }
    }
    const rulesSheet = XLSX.utils.aoa_to_sheet([rulesHeaders, ...rulesRows]);
    rulesSheet["!cols"] = [
      { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 55 }, { wch: 40 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, rulesSheet, "Validation Rules");

    // Trigger download
    XLSX.writeFile(wb, `${template.label.replace(/\s+/g, "_")}_Template.xlsx`);
  }, [template]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(224 100% 91%)" }}>
          <Info className="w-4 h-4" style={{ color: "hsl(224 100% 38%)" }} />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Select the data category you're submitting</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Each template enforces specific validation rules aligned to KHDA reporting standards. Download the template to ensure your data is formatted correctly.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DATA_TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelectTemplate(t.id)}
            className={cn(
              "text-left p-4 rounded-xl border-2 transition-all duration-150 group",
              selectedTemplate === t.id
                ? "border-primary"
                : "border-border bg-card hover:border-primary/30"
            )}
            style={selectedTemplate === t.id ? { background: "hsl(340 56% 40% / 0.04)", borderColor: "hsl(var(--primary))" } : { background: "hsl(0 0% 100%)" }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: selectedTemplate === t.id ? "hsl(340 52% 88%)" : "hsl(236 25% 95%)" }}>
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-semibold leading-tight", selectedTemplate === t.id ? "text-primary" : "text-foreground")}>
                  {t.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{t.frequency} · {t.rowCount} rows</div>
              </div>
              {selectedTemplate === t.id && (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              {t.columns.slice(0, 5).map(c => (
                <span key={c.field} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: "hsl(236 25% 93%)", color: "hsl(214 18% 40%)" }}>
                  {c.field}
                </span>
              ))}
              {t.columns.length > 5 && (
                <span className="text-[9px] text-muted-foreground px-1">+{t.columns.length - 5} more</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-foreground">Selected: {template.label} Schema</div>
          <div className="flex items-center gap-2">
            <span className="badge-info">
              <Clock className="w-3 h-3" />
              {template.frequency} reporting
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {template.columns.map(col => (
            <div key={col.field} className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: "hsl(236 33% 98%)" }}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                col.required ? "bg-error" : "bg-muted-foreground/40"
              )} style={col.required ? { backgroundColor: "hsl(var(--error))" } : {}} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-foreground truncate">{col.field}</div>
                <div className="text-[10px] text-muted-foreground">{col.example}</div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-medium capitalize"
                style={{ background: "hsl(236 25% 91%)", color: "hsl(214 18% 45%)" }}>
                {col.type}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-error" style={{ backgroundColor: "hsl(var(--error))" }} />
            Required field
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-border" />
            Optional field
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download Template (.xlsx)
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3 h-3" /> View Changelog
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          Continue to Upload <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
