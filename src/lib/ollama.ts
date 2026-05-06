const OLLAMA_BASE = "http://localhost:11434";

export interface OllamaGenerateOptions {
  model: string;
  prompt: string;
  temperature?: number;
  timeout?: number;
}

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
}

/**
 * Calls Ollama /api/generate with stream: false.
 * Throws on network error or non-200 status.
 */
export async function ollamaGenerate(
  options: OllamaGenerateOptions,
): Promise<string> {
  const { model, prompt, temperature = 0.3, timeout = 60_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Ollama generate failed (${res.status})`);
    }

    const data: OllamaGenerateResponse = await res.json();
    return data.response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extracts a JSON block from LLM response text.
 * Handles ```json fences, raw ``` fences, and bare JSON.
 */
export function extractJSON<T>(text: string): T | null {
  // Try fenced JSON block first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]) as T;
    } catch {
      /* fall through */
    }
  }

  // Try raw JSON (find first { or [ to last } or ])
  const braceStart = text.indexOf("{");
  const bracketStart = text.indexOf("[");
  const start =
    braceStart >= 0 && (bracketStart < 0 || braceStart < bracketStart)
      ? braceStart
      : bracketStart;

  if (start >= 0) {
    const isArray = text[start] === "[";
    const end = text.lastIndexOf(isArray ? "]" : "}");
    if (end > start) {
      try {
        return JSON.parse(text.substring(start, end + 1)) as T;
      } catch {
        /* fall through */
      }
    }
  }

  return null;
}

/**
 * Quick health check — is Ollama reachable?
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
