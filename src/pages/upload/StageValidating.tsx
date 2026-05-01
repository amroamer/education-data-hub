import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Database, GitBranch, CheckCircle2 } from "lucide-react";

interface StageValidatingProps {
  fileName: string;
  templateLabel: string;
  totalRows: number;
  onComplete: () => void;
}

const VALIDATION_STEPS = [
  { label: "Parsing file structure", detail: "Reading rows and column headers", icon: Database },
  { label: "Schema conformance check", detail: "Verifying required fields and data types", icon: GitBranch },
  { label: "Business rule validation", detail: "Checking referential integrity and domain rules", icon: Shield },
  { label: "Duplicate detection", detail: "Scanning for repeated records", icon: CheckCircle2 },
];

export const StageValidating = ({ fileName, templateLabel, totalRows, onComplete }: StageValidatingProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [rowsProcessed, setRowsProcessed] = useState(0);

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        setRowsProcessed(totalRows);
        setCurrentStep(VALIDATION_STEPS.length);
        setTimeout(onComplete, 700);
      } else {
        setProgress(Math.min(p, 97));
        setRowsProcessed(Math.floor((Math.min(p, 97) / 100) * totalRows));
        setCurrentStep(Math.floor((Math.min(p, 97) / 100) * VALIDATION_STEPS.length));
      }
    }, 160);
    return () => clearInterval(interval);
  }, [onComplete, totalRows]);

  return (
    <div className="animate-fade-up">
      <div className="bg-card border border-border rounded-xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: "hsl(var(--muted))" }} />
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
              style={{ borderTopColor: "hsl(340 56% 40%)", animationDuration: "0.9s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="font-semibold text-foreground text-sm mb-1">Validating {fileName}…</div>
          <div className="text-xs text-muted-foreground">
            {rowsProcessed.toLocaleString()} / {totalRows.toLocaleString()} rows processed
          </div>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "hsl(var(--muted))" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--gradient-accent)" }} />
        </div>

        <div className="space-y-3">
          {VALIDATION_STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            const Icon = step.icon;
            return (
              <div key={step.label} className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                isActive && "border border-border",
                isDone && "opacity-70",
              )} style={isActive ? { background: "hsl(340 56% 40% / 0.04)" } : {}}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                )} style={isDone ? { backgroundColor: "hsl(var(--success))" } : isActive ? { backgroundColor: "hsl(340 56% 40%)" } : { backgroundColor: "hsl(var(--muted))" }}>
                  {isDone
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    : <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-muted-foreground")} />}
                </div>
                <div>
                  <div className={cn("text-xs font-semibold", isDone || isActive ? "text-foreground" : "text-muted-foreground/60")}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{step.detail}</div>
                </div>
                {isActive && (
                  <div className="ml-auto flex gap-0.5">
                    {[0, 1, 2].map(dot => (
                      <div key={dot} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: "hsl(340 56% 40%)", animationDelay: `${dot * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-[11px] text-muted-foreground">
          Validating against <strong className="text-foreground">{templateLabel}</strong> schema rules · KHDA Regulatory Standards v2.1
        </div>
      </div>
    </div>
  );
};
