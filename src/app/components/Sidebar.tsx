import type { JSX } from 'react';
import { navigation } from '../data.js';

export function Sidebar(): JSX.Element {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[#071e3a] px-3 py-5 text-slate-200">
      <div className="px-3 pb-7 text-xl font-bold tracking-tight text-white">
        TWC Campaign Console
      </div>
      <nav className="space-y-1" aria-label="Primary navigation">
        {navigation.map((item) => (
          <button
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
              item === 'Overview'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            key={item}
            type="button"
          >
            <span aria-hidden="true" className="grid size-5 place-items-center text-base">
              {item === 'Overview' ? '⌂' : '•'}
            </span>
            {item}
          </button>
        ))}
      </nav>
      <button
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
        type="button"
      >
        <span aria-hidden="true">⚙</span> Settings
      </button>
    </aside>
  );
}
