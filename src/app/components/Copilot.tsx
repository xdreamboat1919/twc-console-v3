import { type FormEvent, type JSX, useState } from 'react';
import { type ChatMessage, askOllama } from '../../platform/ai/ollama.js';
import { suggestedPrompts } from '../data.js';

const opening: ChatMessage = {
  role: 'assistant',
  content:
    'Preparedness kit needs attention because CPA is rising while ROAS is declining. Start by reviewing landing-page conversion and recent creative changes.',
};

export function Copilot(): JSX.Element {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([opening]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function send(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const prompt = draft.trim();
    if (!prompt || isLoading) return;

    const next = [...messages, { role: 'user' as const, content: prompt }];
    setMessages(next);
    setDraft('');
    setIsLoading(true);

    try {
      const answer = await askOllama(next);
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'I could not reach your local AI. Start Ollama, download the configured model, then try again. Your campaign data stays on this computer.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-[#f4f8ff] p-6 shadow-sm">
      <div className="flex gap-4">
        <div
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-3xl text-blue-600 shadow-sm"
        >
          ✦
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            Ask your campaign copilot
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Private by default. It connects only to the AI model running on this computer.
          </p>
        </div>
      </div>
      <div className="mt-5 max-h-56 space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <p
            className={`rounded-xl px-4 py-3 text-sm leading-6 ${message.role === 'assistant' ? 'bg-white text-slate-700 shadow-sm' : 'ml-auto max-w-[75%] bg-blue-600 text-white'}`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </p>
        ))}
        {isLoading ? <p className="text-sm text-slate-500">Thinking…</p> : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            className="rounded-full border border-blue-200 bg-white px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
            key={prompt}
            onClick={() => setDraft(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
      <form className="mt-5 flex gap-3" onSubmit={send}>
        <label className="sr-only" htmlFor="copilot-prompt">
          Ask anything about your campaigns
        </label>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
          id="copilot-prompt"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask anything about your campaigns…"
          value={draft}
        />
        <button
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={isLoading || !draft.trim()}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );
}
