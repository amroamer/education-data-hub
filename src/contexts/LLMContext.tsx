import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface OllamaModelDetails {
  parent_model?: string;
  format?: string;
  family?: string;
  families?: string[];
  parameter_size?: string;
  quantization_level?: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

interface LLMContextValue {
  models: OllamaModel[];
  selectedModel: string | null;
  setSelectedModel: (name: string) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const STORAGE_KEY = "edh-selected-model";

const LLMContext = createContext<LLMContextValue | null>(null);

async function fetchOllamaModels(): Promise<OllamaModel[]> {
  const res = await fetch("http://localhost:11434/api/tags");
  if (!res.ok) throw new Error(`Ollama unreachable (${res.status})`);
  const data = await res.json();
  return data.models ?? [];
}

export const LLMProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedModel, setSelectedModelState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const { data: models = [], isLoading, error, refetch } = useQuery({
    queryKey: ["ollama-models"],
    queryFn: fetchOllamaModels,
    retry: 1,
    staleTime: 30_000,
  });

  const setSelectedModel = (name: string) => {
    setSelectedModelState(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  useEffect(() => {
    if (models.length > 0 && selectedModel && !models.find(m => m.name === selectedModel)) {
      setSelectedModelState(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [models, selectedModel]);

  return (
    <LLMContext.Provider value={{
      models,
      selectedModel,
      setSelectedModel,
      isLoading,
      error: error as Error | null,
      refetch,
    }}>
      {children}
    </LLMContext.Provider>
  );
};

export const useLLM = () => {
  const ctx = useContext(LLMContext);
  if (!ctx) throw new Error("useLLM must be used within LLMProvider");
  return ctx;
};
