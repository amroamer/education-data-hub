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
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const STORAGE_KEY = "edh-selected-model";
const URL_STORAGE_KEY = "edh-ollama-url";
const DEFAULT_OLLAMA_URL = "/khdaDataHub/ollama";

const LLMContext = createContext<LLMContextValue | null>(null);

async function fetchOllamaModels(baseUrl: string): Promise<OllamaModel[]> {
  const url = baseUrl.replace(/\/+$/, "");
  const res = await fetch(`${url}/api/tags`);
  if (!res.ok) throw new Error(`Ollama unreachable (${res.status})`);
  const data = await res.json();
  return data.models ?? [];
}

export const LLMProvider = ({ children }: { children: React.ReactNode }) => {
  const [ollamaUrl, setOllamaUrlState] = useState<string>(
    () => localStorage.getItem(URL_STORAGE_KEY) || DEFAULT_OLLAMA_URL
  );

  const setOllamaUrl = (url: string) => {
    const trimmed = url.replace(/\/+$/, "");
    setOllamaUrlState(trimmed);
    localStorage.setItem(URL_STORAGE_KEY, trimmed);
  };

  const [selectedModel, setSelectedModelState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const { data: models = [], isLoading, error, refetch } = useQuery({
    queryKey: ["ollama-models", ollamaUrl],
    queryFn: () => fetchOllamaModels(ollamaUrl),
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
      ollamaUrl,
      setOllamaUrl,
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
