export interface ChatMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

interface OllamaResponse {
  readonly message?: { readonly content?: string };
}

const endpoint = import.meta.env.VITE_OLLAMA_URL ?? 'http://127.0.0.1:11434';
const model = import.meta.env.VITE_OLLAMA_MODEL ?? 'llama3.2';

/** Calls a model running on this computer. No API key is sent or stored. */
export async function askOllama(messages: readonly ChatMessage[]): Promise<string> {
  const response = await fetch(`${endpoint}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Local AI returned ${response.status}`);
  }

  const payload = (await response.json()) as OllamaResponse;
  const answer = payload.message?.content?.trim();

  if (!answer) {
    throw new Error('Local AI returned an empty response');
  }

  return answer;
}
