import { Settings as SettingsIcon, RefreshCw, CheckCircle2, AlertCircle, Cpu, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLLM } from "@/contexts/LLMContext";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const Settings = () => {
  const { models, selectedModel, setSelectedModel, isLoading, error, refetch } = useLLM();

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage LLM model configuration for AI-assisted features
        </p>
      </div>

      {selectedModel && (
        <div className="stat-card flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(152 69% 31%)" }} />
          <div>
            <div className="text-xs text-muted-foreground">Active Model</div>
            <div className="text-sm font-semibold text-foreground">{selectedModel}</div>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Cannot connect to Ollama</p>
              <p className="text-xs text-muted-foreground">
                Make sure Ollama is running at http://localhost:11434
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3 mr-1.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Available Models
        </div>
        {!isLoading && !error && (
          <button
            onClick={() => refetch()}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && models.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => {
            const isActive = selectedModel === model.name;
            return (
              <Card
                key={model.digest}
                className={cn(
                  "transition-all hover:shadow-md",
                  isActive && "ring-2 ring-primary/50 border-primary/30"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-semibold">{model.name}</CardTitle>
                    {isActive && <Badge className="badge-success text-[10px]">Active</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {model.details.family && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Cpu className="w-3 h-3" />
                        <span>{model.details.family}</span>
                      </div>
                    )}
                    {model.details.parameter_size && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-medium text-foreground">{model.details.parameter_size}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <HardDrive className="w-3 h-3" />
                      <span>{formatBytes(model.size)}</span>
                    </div>
                    {model.details.quantization_level && (
                      <div>
                        <Badge variant="secondary" className="text-[10px]">
                          {model.details.quantization_level}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setSelectedModel(model.name)}
                    disabled={isActive}
                    variant={isActive ? "secondary" : "default"}
                    className="w-full"
                    size="sm"
                  >
                    {isActive ? "Currently Active" : "Set as Active"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !error && models.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <SettingsIcon className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No models found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pull a model with <code className="bg-muted px-1.5 py-0.5 rounded">ollama pull llama3</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;
