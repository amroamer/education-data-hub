import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Shield, Database, GitBranch, CheckCircle2, Brain, Search,
  Loader2, AlertTriangle, AlertCircle, Info, CircleDot, ArrowLeft,
} from "lucide-react";
import { DataTemplate, MappedColumn, ValidationResults, ValidationIssue } from "./types";
import { useOllamaAgent, type AgentStatus } from "@/hooks/useOllamaAgent";
import { runValidationAgent, runRuleBasedValidation, type ValidationAgentResult } from "@/lib/agents/validationAgent";
import { useLLM } from "@/contexts/LLMContext";

interface StageValidatingProps {
  fileName: string;
  templateLabel: string;
  template: DataTemplate;
  mapping: MappedColumn[];
  totalRows: number;
  fileRows?: Record<string, string>[];
  onComplete: (results: ValidationResults) => void;
  onBack?: () => void;
}

const VALIDATION_STEPS = [
  { label: "Parsing file structure", detail: "Reading rows and column headers", icon: Database },
  { label: "Schema conformance check", detail: "Verifying required fields and data types", icon: GitBranch },
  { label: "Business rule validation", detail: "Checking referential integrity and domain rules", icon: Shield },
  { label: "Duplicate & anomaly detection", detail: "Scanning for repeated records and outliers", icon: Search },
  { label: "Generating quality report", detail: "Computing quality scores and remediation suggestions", icon: Brain },
];

function buildFallbackResults(
  template: DataTemplate,
  mapping: MappedColumn[],
  totalRows: number,
  fileRows?: Record<string, string>[],
): ValidationAgentResult {
  return runRuleBasedValidation(template, mapping, totalRows, fileRows);
}

const SEVERITY_CONFIG = {
  error: { icon: AlertCircle, color: "hsl(0 72% 51%)", bg: "hsl(0 86% 97%)", label: "Error" },
  warning: { icon: AlertTriangle, color: "hsl(36 100% 40%)", bg: "hsl(43 96% 96%)", label: "Warning" },
  info: { icon: Info, color: "hsl(224 100% 50%)", bg: "hsl(224 100% 97%)", label: "Info" },
};

export const StageValidating = ({
  fileName,
  templateLabel,
  template,
  mapping,
  totalRows,
  fileRows,
  onComplete,
  onBack,
}: StageValidatingProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [rowsProcessed, setRowsProcessed] = useState(0);
  const [streamedIssues, setStreamedIssues] = useState<ValidationIssue[]>([]);
  const [issueCounts, setIssueCounts] = useState({ error: 0, warning: 0, info: 0 });
  const agentDoneRef = useRef(false);
  const resultsRef = useRef<ValidationResults | null>(null);
  const issueListRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useLLM();

  const mappedFieldCount = useMemo(
    () => mapping.filter(m => m.sourceColumn).length,
    [mapping],
  );

  const fallbackFn = useCallback(
    () => buildFallbackResults(template, mapping, totalRows, fileRows),
    [template, mapping, totalRows, fileRows],
  );

  const agentFn = useCallback(
    (model: string) => runValidationAgent(model, template, mapping, totalRows, fileRows),
    [template, mapping, totalRows, fileRows],
  );

  const onAgentSuccess = useCallback(
    (result: ValidationAgentResult) => {
      resultsRef.current = {
        issues: result.issues,
        qualityDimensions: result.qualityDimensions,
        remediations: result.remediations,
        totalRows: result.totalRows,
        summary: result.summary,
      };
      agentDoneRef.current = true;
    },
    [],
  );

  const { status, run } = useOllamaAgent<ValidationAgentResult>({
    agentFn,
    fallbackFn,
    onSuccess: onAgentSuccess,
  });

  // Main progress + agent orchestration
  useEffect(() => {
    run();

    let p = 0;
    const interval = setInterval(() => {
      if (agentDoneRef.current) {
        clearInterval(interval);
        setProgress(100);
        setRowsProcessed(totalRows);
        setCurrentStep(VALIDATION_STEPS.length);

        // Stream all issues from results
        const results = resultsRef.current;
        if (results) {
          // Stream issues one by one
          results.issues.forEach((issue, idx) => {
            setTimeout(() => {
              setStreamedIssues(prev => [...prev, issue]);
              setIssueCounts(prev => ({
                ...prev,
                [issue.severity]: prev[issue.severity] + 1,
              }));
            }, idx * 150);
          });

          // Complete after all issues streamed
          setTimeout(() => {
            onComplete(results);
          }, results.issues.length * 150 + 1200);
        }
        return;
      }

      p += Math.random() * 3 + 0.8;
      if (p >= 85) p = 85;
      setProgress(p);
      setRowsProcessed(Math.floor((p / 100) * totalRows));
      setCurrentStep(
        Math.min(
          Math.floor((p / 100) * VALIDATION_STEPS.length),
          VALIDATION_STEPS.length - 1,
        ),
      );
    }, 200);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll issue list
  useEffect(() => {
    if (issueListRef.current) {
      issueListRef.current.scrollTop = issueListRef.current.scrollHeight;
    }
  }, [streamedIssues]);

  return (
    <div className="animate-fade-up space-y-4">
      {/* Agent header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center gap-3"
          style={{ background: "hsl(224 100% 97%)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(224 100% 88%)" }}>
            <Shield className="w-4 h-4" style={{ color: "hsl(224 100% 38%)" }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              Validation Agent
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "hsl(224 100% 91%)", color: "hsl(224 100% 30%)" }}>
                {selectedModel || "rule-based"}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Validating {totalRows.toLocaleString()} rows against {templateLabel} schema · {mappedFieldCount} mapped fields
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {progress >= 100 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--success))" }} />
                <span className="text-[10px] font-medium" style={{ color: "hsl(152 55% 40%)" }}>Complete</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "hsl(152 55% 50%)" }} />
                <span className="text-[10px] font-medium" style={{ color: "hsl(152 55% 40%)" }}>Running</span>
              </>
            )}
          </div>
        </div>

        {/* Progress bar + row counter */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">{Math.round(progress)}%</span>
            <span className="text-[10px] text-muted-foreground">
              {rowsProcessed.toLocaleString()} / {totalRows.toLocaleString()} rows
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "var(--gradient-accent)" }} />
          </div>
        </div>

        {/* Agent steps */}
        <div className="px-4 pb-3 space-y-1">
          {VALIDATION_STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep || progress >= 100;
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

      {/* Live issue counters + issue stream */}
      <div className="bg-card border border-border rounded-xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between"
          style={{ background: "hsl(236 25% 97%)" }}>
          <span className="text-xs font-semibold text-foreground">Live Issues</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" style={{ color: "hsl(0 72% 51%)" }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(0 72% 51%)" }}>
                {issueCounts.error}
              </span>
              <span className="text-[10px] text-muted-foreground">errors</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" style={{ color: "hsl(36 100% 40%)" }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(36 100% 40%)" }}>
                {issueCounts.warning}
              </span>
              <span className="text-[10px] text-muted-foreground">warnings</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" style={{ color: "hsl(224 100% 50%)" }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(224 100% 50%)" }}>
                {issueCounts.info}
              </span>
              <span className="text-[10px] text-muted-foreground">info</span>
            </div>
          </div>
        </div>

        <div ref={issueListRef} className="max-h-48 overflow-y-auto divide-y divide-border">
          {streamedIssues.length === 0 ? (
            <div className="px-4 py-6 text-center">
              {progress >= 100 ? (
                <div className="text-xs text-muted-foreground">Processing results...</div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Scanning for issues...</span>
                </div>
              )}
            </div>
          ) : (
            streamedIssues.map((issue, idx) => {
              const sev = SEVERITY_CONFIG[issue.severity];
              const SevIcon = sev.icon;
              return (
                <div key={idx} className="px-4 py-2 flex items-start gap-2.5 animate-fade-up"
                  style={{ background: idx === streamedIssues.length - 1 ? sev.bg : undefined }}>
                  <SevIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: sev.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded"
                        style={{ background: "hsl(236 25% 93%)", color: "hsl(214 18% 40%)" }}>
                        Row {issue.row}
                      </span>
                      <span className="text-[10px] font-semibold text-foreground">{issue.field}</span>
                      {issue.value && (
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                          "{issue.value}"
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{issue.message}</div>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground/60 flex-shrink-0">{issue.ruleCode}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            disabled={progress > 0 && progress < 100}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mapping
          </button>
        ) : <div />}
        <div className="text-[11px] text-muted-foreground">
          Validating against <strong className="text-foreground">{templateLabel}</strong> schema · KHDA Regulatory Standards v2.1
        </div>
      </div>
    </div>
  );
};
