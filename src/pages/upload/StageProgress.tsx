import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Stage } from "./types";

const STEPS: { key: Stage; label: string; sublabel: string }[] = [
  { key: "select", label: "Template", sublabel: "Choose data type" },
  { key: "upload", label: "Upload", sublabel: "Drop your file" },
  { key: "mapping", label: "Map Columns", sublabel: "Match fields" },
  { key: "validating", label: "Validate", sublabel: "Run rules" },
  { key: "results", label: "Review", sublabel: "Quality report" },
];

const STAGE_ORDER: Stage[] = ["select", "upload", "mapping", "validating", "results"];

interface StageProgressProps {
  stage: Stage;
}

export const StageProgress = ({ stage }: StageProgressProps) => {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="flex items-center w-full mb-6">
      {STEPS.map((step, i) => {
        const stepIdx = STAGE_ORDER.indexOf(step.key);
        const isDone = stepIdx < currentIdx;
        const isActive = stepIdx === currentIdx;
        const isUpcoming = stepIdx > currentIdx;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all",
              isActive && "bg-primary/8",
            )}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                isDone && "bg-success",
                isActive && "bg-primary ring-4 ring-primary/20",
                isUpcoming && "bg-muted",
              )} style={isDone ? { backgroundColor: "hsl(var(--success))" } : isActive ? { backgroundColor: "hsl(var(--primary))" } : {}}>
                {isDone
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  : <span className={cn(isActive ? "text-white" : "text-muted-foreground")}>{i + 1}</span>
                }
              </div>
              <div className="hidden sm:block">
                <div className={cn("text-xs font-semibold leading-tight", isActive ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/60")}>
                  {step.label}
                </div>
                <div className={cn("text-[10px] leading-tight", isActive ? "text-muted-foreground" : "text-muted-foreground/40")}>
                  {step.sublabel}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-1">
                <div className={cn("h-0.5 rounded-full transition-all", isDone ? "bg-success" : "bg-border")}
                  style={isDone ? { backgroundColor: "hsl(var(--success))" } : {}} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
