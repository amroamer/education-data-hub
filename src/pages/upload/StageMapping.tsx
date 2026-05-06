import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ChevronDown, CheckCircle2, AlertTriangle, Info, Zap, Sparkles, Brain, Search, GitCompare, CircleDot, Loader2 } from "lucide-react";
import { DataTemplate, MappedColumn, ParsedFileData } from "./types";
import { useOllamaAgent, type AgentStatus } from "@/hooks/useOllamaAgent";
import { runMappingAgent, type MappingAgentResult } from "@/lib/agents/mappingAgent";
import { useLLM } from "@/contexts/LLMContext";

interface StageMappingProps {
  template: DataTemplate;
  fileName: string;
  parsedFileData: ParsedFileData | null;
  onRunValidation: (mapping: MappedColumn[]) => void;
  onBack: () => void;
}

const CONFIDENCE_COLORS = {
  high: { badge: "badge-success", label: "Auto-matched" },
  medium: { badge: "badge-warning", label: "Suggest" },
  manual: { badge: "badge-error", label: "Review" },
  unmapped: { badge: "badge-pending", label: "Unmapped" },
};

/**
 * Build sample data lookup from parsed file: { columnName -> [val1, val2, val3] }
 */
function buildSampleData(parsedFileData: ParsedFileData | null): Record<string, string[]> {
  if (!parsedFileData) return {};
  const result: Record<string, string[]> = {};
  for (const header of parsedFileData.headers) {
    result[header] = parsedFileData.sampleRows
      .map(row => row[header] ?? "")
      .filter(v => v !== "")
      .slice(0, 3);
  }
  return result;
}

/**
 * Deterministic fallback mapping — matches columns by position order.
 * All confidence set to "manual" since we can't verify correctness without AI.
 */
function buildFallbackMapping(
  template: DataTemplate,
  sourceColumns: string[],
  sampleData: Record<string, string[]>,
): MappedColumn[] {
  return template.columns.map((col) => ({
    schemaField: col.field,
    sourceColumn: "",
    confidence: "unmapped" as const,
    sampleValues: [],
    type: col.type,
  }));
}

const AGENT_STEPS = [
  { icon: CircleDot, label: "Initializing mapping agent", detail: "Preparing schema context and source metadata" },
  { icon: Search, label: "Scanning source columns", detail: "Reading column headers and sample data from file" },
  { icon: Brain, label: "Analyzing semantic matches", detail: "Comparing field names, data types, and value patterns" },
  { icon: GitCompare, label: "Resolving best mappings", detail: "Ranking candidates and resolving conflicts" },
];

const MappingLoadingState = ({ status, modelName, sourceCount, schemaCount }: {
  status: AgentStatus;
  modelName: string;
  sourceCount: number;
  schemaCount: number;
}) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (status !== "running") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    AGENT_STEPS.forEach((_, stepIdx) => {
      timers.push(setTimeout(() => setActiveStep(stepIdx), elapsed));
      elapsed += 1800;
    });

    return () => timers.forEach(clearTimeout);
  }, [status]);

  return (
    <div className="animate-fade-up space-y-4">
      {/* Agent header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center gap-3"
          style={{ background: "hsl(224 100% 97%)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(224 100% 88%)" }}>
            <Brain className="w-4 h-4" style={{ color: "hsl(224 100% 38%)" }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              Mapping Agent
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "hsl(224 100% 91%)", color: "hsl(224 100% 30%)" }}>
                {modelName || "connecting..."}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Analyzing {sourceCount} source columns against {schemaCount} schema fields
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "hsl(152 55% 50%)" }} />
            <span className="text-[10px] font-medium" style={{ color: "hsl(152 55% 40%)" }}>Running</span>
          </div>
        </div>

        {/* Agent steps */}
        <div className="px-4 py-3 space-y-1">
          {AGENT_STEPS.map((step, idx) => {
            const isActive = idx === activeStep;
            const isDone = idx < activeStep;
            const isPending = idx > activeStep;
            return (
              <div key={idx} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
                isActive && "bg-muted/50",
              )}>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "hsl(224 100% 50%)" }} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs font-medium transition-colors",
                    isDone ? "text-muted-foreground" : isActive ? "text-foreground" : "text-muted-foreground/50",
                  )}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div className="text-[10px] text-muted-foreground mt-0.5 animate-fade-up">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export const StageMapping = ({ template, fileName, parsedFileData, onRunValidation, onBack }: StageMappingProps) => {
  const [mapping, setMapping] = useState<MappedColumn[] | null>(null);
  const [reasoning, setReasoning] = useState<Record<string, string>>({});
  const [usedAI, setUsedAI] = useState(false);
  const { selectedModel } = useLLM();

  // Real columns and sample data from the parsed file
  const sourceColumns = parsedFileData?.headers ?? [];
  const sampleData = useMemo(() => buildSampleData(parsedFileData), [parsedFileData]);
  const totalRows = parsedFileData?.totalRows ?? 0;

  const fallbackFn = useCallback(
    () => {
      const mappings = buildFallbackMapping(template, sourceColumns, sampleData);
      const reasoning: Record<string, string> = {};
      for (const col of template.columns) {
        reasoning[col.field] = "AI unavailable — please map this field manually.";
      }
      return { mappings, reasoning };
    },
    [template, sourceColumns, sampleData],
  );

  const agentFn = useCallback(
    (model: string) => runMappingAgent(model, template, sourceColumns, sampleData),
    [template, sourceColumns, sampleData],
  );

  const onSuccess = useCallback(
    (result: MappingAgentResult, ai: boolean) => {
      setMapping(result.mappings);
      setReasoning(result.reasoning);
      setUsedAI(ai);
    },
    [],
  );

  const { status, run } = useOllamaAgent<MappingAgentResult>({
    agentFn,
    fallbackFn,
    onSuccess,
  });

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoMatched = useMemo(
    () => mapping?.filter(m => m.confidence === "high").length ?? 0,
    [mapping],
  );
  const needsReview = useMemo(
    () => mapping?.filter(m => m.confidence === "manual" || m.confidence === "unmapped").length ?? 0,
    [mapping],
  );

  const requiredUnmapped = useMemo(() => {
    if (!mapping) return 0;
    return mapping.filter(m => {
      const col = template.columns.find(c => c.field === m.schemaField);
      return col?.required && !m.sourceColumn;
    }).length;
  }, [mapping, template.columns]);

  const canProceed = requiredUnmapped === 0;

  const updateMapping = (schemaField: string, sourceColumn: string) => {
    setMapping(prev =>
      prev?.map(m =>
        m.schemaField === schemaField
          ? {
              ...m,
              sourceColumn,
              confidence: sourceColumn ? "medium" : "unmapped",
              sampleValues: sourceColumn ? (sampleData[sourceColumn] || []) : [],
            }
          : m,
      ) ?? null,
    );
  };

  if (!mapping) {
    return <MappingLoadingState
      status={status}
      modelName={selectedModel || ""}
      sourceCount={sourceColumns.length}
      schemaCount={template.columns.length}
    />;
  }

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
            {template.columns.length} schema fields · {sourceColumns.length} source columns detected · {totalRows.toLocaleString()} rows
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
            {usedAI ? (
              <>
                <strong>{autoMatched} columns AI-matched</strong> using {selectedModel}. Review manually-flagged fields below.
              </>
            ) : (
              <>
                <strong>{autoMatched} columns auto-matched</strong> using header similarity and data type inference. Review manually-flagged fields below.
              </>
            )}
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
            { label: "Sample Values", span: "col-span-3" },
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
            <div key={row.schemaField}>
              <div
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
                      {sourceColumns.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-3 pr-3">
                  <div className="flex flex-col gap-0.5">
                    {row.sampleValues.length > 0 ? (
                      row.sampleValues.slice(0, 2).map((v, vi) => (
                        <span key={vi} className="text-[10px] font-mono text-muted-foreground truncate">{v}</span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50 italic">No data</span>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <span className={conf.badge}>{conf.label}</span>
                </div>
              </div>

              {/* Reasoning row — shown for every row that has reasoning */}
              {reasoning[row.schemaField] && (
                <div className="px-4 pb-2 pt-0.5 border-b border-border"
                  style={{ background: row.confidence === "unmapped" || row.confidence === "manual"
                    ? "hsl(0 86% 97% / 0.3)"
                    : "hsl(224 100% 97% / 0.5)" }}>
                  <div className="flex items-start gap-1.5 pl-3">
                    <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" style={{
                      color: row.confidence === "unmapped" || row.confidence === "manual"
                        ? "hsl(0 72% 51%)"
                        : "hsl(224 100% 50%)"
                    }} />
                    <span className="text-[10px] text-muted-foreground italic leading-relaxed">
                      {reasoning[row.schemaField]}
                    </span>
                  </div>
                </div>
              )}
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
          {requiredUnmapped > 0
            ? <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(var(--error))" }} /> {requiredUnmapped} required field(s) not mapped</span>
            : needsReview > 0
            ? <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(var(--warning))" }} /> {needsReview} optional field(s) need review</span>
            : <span className="flex items-center gap-1.5 text-success"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--success))" }} /> All fields mapped</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => onRunValidation(mapping)}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Run Validation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
