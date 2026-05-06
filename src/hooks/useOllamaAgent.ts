import { useState, useCallback, useRef } from "react";
import { useLLM } from "@/contexts/LLMContext";
import { isOllamaAvailable } from "@/lib/ollama";
import { toast } from "sonner";

export type AgentStatus =
  | "idle"
  | "checking"
  | "running"
  | "success"
  | "error"
  | "fallback";

interface UseOllamaAgentOptions<T> {
  agentFn: (model: string) => Promise<T>;
  fallbackFn: () => T;
  onSuccess?: (result: T, usedAI: boolean) => void;
}

export function useOllamaAgent<T>({
  agentFn,
  fallbackFn,
  onSuccess,
}: UseOllamaAgentOptions<T>) {
  const { selectedModel } = useLLM();
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const abortRef = useRef(false);

  const run = useCallback(async () => {
    abortRef.current = false;
    setError(null);

    if (!selectedModel) {
      setStatus("fallback");
      const fb = fallbackFn();
      setResult(fb);
      onSuccess?.(fb, false);
      toast.info("No AI model selected", {
        description:
          "Go to Settings to select a model for AI-powered features.",
        duration: 5000,
      });
      return;
    }

    setStatus("checking");
    const available = await isOllamaAvailable();

    if (!available || abortRef.current) {
      setStatus("fallback");
      const fb = fallbackFn();
      setResult(fb);
      if (!abortRef.current) {
        onSuccess?.(fb, false);
        toast.info("AI unavailable — using rule-based analysis", {
          description:
            "Make sure Ollama is running at localhost:11434.",
          duration: 5000,
        });
      }
      return;
    }

    setStatus("running");
    try {
      const agentResult = await agentFn(selectedModel);
      if (abortRef.current) return;
      setResult(agentResult);
      setStatus("success");
      onSuccess?.(agentResult, true);
    } catch (err) {
      if (abortRef.current) return;
      const msg = err instanceof Error ? err.message : "Agent failed";
      console.error("Agent failed, using fallback:", err);
      setError(msg);
      setStatus("fallback");
      const fb = fallbackFn();
      setResult(fb);
      onSuccess?.(fb, false);
      toast.info("AI analysis failed — using rule-based analysis", {
        description: msg,
        duration: 5000,
      });
    }
  }, [selectedModel, agentFn, fallbackFn, onSuccess]);

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { status, error, result, run, cancel };
}
