import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Info, FileText, Download,
  Table, TrendingUp, ShieldCheck, Filter, ArrowUpRight, RotateCcw,
} from "lucide-react";
import { MOCK_ISSUES, QUALITY_DIMENSIONS } from "./data";

interface StageResultsProps {
  fileName: string;
  templateLabel: string;
  onReset: () => void;
}

const TOTAL_ROWS = 1284;
const ERRORS = MOCK_ISSUES.filter(i => i.severity === "error").length;
const WARNINGS = MOCK_ISSUES.filter(i => i.severity === "warning").length;
const INFOS = MOCK_ISSUES.filter(i => i.severity === "info").length;
const PASSED = TOTAL_ROWS - ERRORS;
const PASS_RATE = Math.round((PASSED / TOTAL_ROWS) * 100);

type FilterType = "all" | "error" | "warning" | "info";

export const StageResults = ({ fileName, templateLabel, onReset }: StageResultsProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"issues" | "quality" | "summary">("summary");

  const filteredIssues = activeFilter === "all"
    ? MOCK_ISSUES
    : MOCK_ISSUES.filter(i => i.severity === activeFilter);

  const overallQuality = Math.round(QUALITY_DIMENSIONS.reduce((sum, d) => sum + d.score, 0) / QUALITY_DIMENSIONS.length);

  return (
    <div className="space-y-4 animate-fade-up">

      <div className={cn("rounded-xl p-5 flex items-center gap-4 border")}
        style={PASS_RATE >= 95
          ? { background: "hsl(152 55% 95%)", borderColor: "hsl(152 69% 31% / 0.2)" }
          : PASS_RATE >= 80
          ? { background: "hsl(43 100% 95%)", borderColor: "hsl(36 100% 50% / 0.3)" }
          : { background: "hsl(0 86% 97%)", borderColor: "hsl(0 72% 51% / 0.2)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl"
          style={PASS_RATE >= 95
            ? { background: "hsl(var(--success))", color: "white" }
            : PASS_RATE >= 80
            ? { background: "hsl(36 100% 36%)", color: "white" }
            : { background: "hsl(var(--error))", color: "white" }}>
          {PASS_RATE}%
        </div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">
            {PASS_RATE >= 95 ? "✓ Excellent data quality — ready to submit" : PASS_RATE >= 80 ? "⚠ Acceptable — review warnings before submitting" : "✕ Below threshold — resolve critical errors"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {fileName} · {templateLabel} · {TOTAL_ROWS.toLocaleString()} records · {ERRORS} errors · {WARNINGS} warnings
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-white hover:bg-muted/50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          {PASS_RATE >= 80 && (
            <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:brightness-110"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              Submit Data <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Records", value: TOTAL_ROWS.toLocaleString(), icon: Table, color: "text-primary", bg: "hsl(340 52% 88%)", iconColor: "hsl(340 56% 40%)" },
          { label: "Passed", value: PASSED.toLocaleString(), icon: CheckCircle2, color: "", bg: "hsl(152 55% 92%)", iconColor: "hsl(var(--success))" },
          { label: "Errors", value: ERRORS.toString(), icon: XCircle, color: "", bg: "hsl(0 86% 94%)", iconColor: "hsl(var(--error))" },
          { label: "Warnings", value: WARNINGS.toString(), icon: AlertTriangle, color: "", bg: "hsl(43 100% 92%)", iconColor: "hsl(36 100% 36%)" },
          { label: "Data Quality", value: `${overallQuality}%`, icon: ShieldCheck, color: "", bg: "hsl(224 100% 91%)", iconColor: "hsl(224 100% 38%)" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-3.5"
            style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: item.bg }}>
              <item.icon className="w-3.5 h-3.5" style={{ color: item.iconColor || undefined }} />
            </div>
            <div className="text-lg font-bold text-foreground">{item.value}</div>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-0 border-b border-border">
        {[
          { key: "summary", label: "Quality Summary" },
          { key: "issues", label: `Issues (${MOCK_ISSUES.length})` },
          { key: "quality", label: "Quality Dimensions" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            style={activeTab === tab.key ? { borderBottomColor: "hsl(var(--primary))", color: "hsl(var(--primary))" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-foreground">Records by Status</div>
              <div className="text-xs text-muted-foreground">{TOTAL_ROWS.toLocaleString()} total</div>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
              <div className="transition-all" style={{ width: `${(PASSED / TOTAL_ROWS) * 100}%`, background: "hsl(var(--success))" }} />
              <div className="transition-all" style={{ width: `${(WARNINGS / TOTAL_ROWS) * 100}%`, background: "hsl(36 100% 50%)" }} />
              <div className="transition-all" style={{ width: `${(ERRORS / TOTAL_ROWS) * 100}%`, background: "hsl(var(--error))" }} />
            </div>
            <div className="flex gap-4">
              {[
                { label: "Passed", count: PASSED, color: "hsl(var(--success))" },
                { label: "Warnings", count: WARNINGS, color: "hsl(36 100% 50%)" },
                { label: "Errors", count: ERRORS, color: "hsl(var(--error))" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                  {item.label}: <strong className="text-foreground">{item.count.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="text-xs font-semibold text-foreground mb-3">Error Distribution by Field</div>
            {Object.entries(
              MOCK_ISSUES.filter(i => i.severity === "error").reduce((acc, i) => {
                acc[i.field] = (acc[i.field] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).map(([field, count]) => (
              <div key={field} className="flex items-center gap-3 mb-2">
                <div className="text-xs text-foreground w-36 flex-shrink-0 font-medium">{field}</div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(count / ERRORS) * 100}%`, background: "hsl(var(--error))" }} />
                </div>
                <div className="text-xs text-muted-foreground w-8 text-right">{count}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-primary" style={{ color: "hsl(var(--primary))" }} />
                <div className="text-xs font-semibold text-foreground">Export Error Report</div>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Download a highlighted Excel file with all errors marked in red for easy correction.</p>
              <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                Download .xlsx <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                <div className="text-xs font-semibold text-foreground">Fix & Re-upload</div>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Correct the {ERRORS} errors in your file and re-upload. Your column mapping will be remembered.</p>
              <button onClick={onReset} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                Start new upload <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "issues" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {(["all", "error", "warning", "info"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all capitalize",
                  activeFilter === f
                    ? f === "error" ? "badge-error" : f === "warning" ? "badge-warning" : f === "info" ? "badge-info" : "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                style={activeFilter === f && f === "all" ? { backgroundColor: "hsl(var(--primary))", color: "white" } : {}}
              >
                {f === "all" ? `All (${MOCK_ISSUES.length})` : f === "error" ? `Errors (${ERRORS})` : f === "warning" ? `Warnings (${WARNINGS})` : `Info (${INFOS})`}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="grid grid-cols-12 gap-0 px-4 py-2.5 border-b border-border"
              style={{ background: "hsl(236 25% 97%)" }}>
              {[
                { label: "Severity", span: "col-span-2" },
                { label: "Row", span: "col-span-1" },
                { label: "Field", span: "col-span-2" },
                { label: "Rule", span: "col-span-2" },
                { label: "Value Found", span: "col-span-2" },
                { label: "Issue Description", span: "col-span-3" },
              ].map(h => (
                <div key={h.label} className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", h.span)}>
                  {h.label}
                </div>
              ))}
            </div>
            {filteredIssues.map((issue, i) => (
              <div key={i} className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-border items-start hover:bg-muted/20 transition-colors last:border-0">
                <div className="col-span-2">
                  <span className={issue.severity === "error" ? "badge-error" : issue.severity === "warning" ? "badge-warning" : "badge-info"}>
                    {issue.severity === "error"
                      ? <XCircle className="w-3 h-3" />
                      : issue.severity === "warning"
                      ? <AlertTriangle className="w-3 h-3" />
                      : <Info className="w-3 h-3" />}
                    {issue.severity}
                  </span>
                </div>
                <div className="col-span-1 text-xs font-mono text-muted-foreground pt-0.5">#{issue.row}</div>
                <div className="col-span-2 text-xs font-semibold text-foreground pt-0.5">{issue.field}</div>
                <div className="col-span-2 pt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "hsl(236 25% 93%)", color: "hsl(214 18% 40%)" }}>
                    {issue.ruleCode}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-mono pt-0.5" style={{ color: "hsl(0 72% 45%)" }}>
                  {issue.value || <span className="text-muted-foreground italic">empty</span>}
                </div>
                <div className="col-span-3 text-[11px] text-muted-foreground leading-relaxed">{issue.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "quality" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {QUALITY_DIMENSIONS.map(dim => (
              <div key={dim.name} className="bg-card border border-border rounded-xl p-4"
                style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-foreground">{dim.name}</div>
                  <div className="flex items-center gap-2">
                    {dim.issueCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "hsl(0 86% 94%)", color: "hsl(var(--error))" }}>
                        {dim.issueCount} issues
                      </span>
                    )}
                    <span className="text-sm font-bold" style={{
                      color: dim.score >= 95 ? "hsl(var(--success))" : dim.score >= 80 ? "hsl(36 100% 36%)" : "hsl(var(--error))"
                    }}>
                      {dim.score}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "hsl(var(--muted))" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${dim.score}%`,
                      background: dim.score >= 95 ? "hsl(var(--success))" : dim.score >= 80 ? "hsl(36 100% 50%)" : "hsl(var(--error))"
                    }} />
                </div>
                <div className="text-[11px] text-muted-foreground">{dim.description}</div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: "hsl(340 56% 40%)" }} />
              <div className="text-xs font-semibold text-foreground">Overall Data Quality Score</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold" style={{
                color: overallQuality >= 95 ? "hsl(var(--success))" : overallQuality >= 80 ? "hsl(36 100% 36%)" : "hsl(var(--error))"
              }}>
                {overallQuality}%
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${overallQuality}%`, background: "var(--gradient-accent)" }} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Composite score across 6 data quality dimensions · KHDA threshold: 90%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
