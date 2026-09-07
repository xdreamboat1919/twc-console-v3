import type { JSX } from 'react';
import { navigation } from '../data.js';

interface SidebarProps {
  readonly activeView: 'overview' | 'core';
  readonly onOpenOverview: () => void;
  readonly onOpenCore: (section: string) => void;
}

const coreRoutes: Record<string, string> = {
  Campaigns: 'daily',
  'Ad sets': 'scaleops',
  Creatives: 'creativeops',
  Audiences: 'aud',
  Reports: 'report',
  Experiments: 'experiments',
  Alerts: 'actions',
  Notes: 'changes',
};

export function Sidebar({ activeView, onOpenCore, onOpenOverview }: SidebarProps): JSX.Element {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col overflow-y-auto bg-[#071e3a] px-3 py-5 text-slate-200">
      <div className="px-3 pb-7 text-xl font-bold tracking-tight text-white">
        TWC Campaign Console
      </div>
      <nav className="space-y-1" aria-label="Primary navigation">
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
            activeView === 'overview'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          onClick={onOpenOverview}
          type="button"
        >
          <span aria-hidden="true" className="grid size-5 place-items-center text-base">
            ⌂
          </span>
          Overview
        </button>
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
            activeView === 'core'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          onClick={() => onOpenCore('routine')}
          type="button"
        >
          <span aria-hidden="true" className="grid size-5 place-items-center text-base">
            ◈
          </span>
          Core console
        </button>
        {navigation
          .filter((item) => item !== 'Overview')
          .map((item) => (
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              key={item}
              onClick={() => onOpenCore(coreRoutes[item])}
              type="button"
            >
              <span aria-hidden="true" className="grid size-5 place-items-center text-base">
                •
              </span>
              {item}
            </button>
          ))}
      </nav>
      <button
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
        onClick={() => onOpenCore('preflight')}
        type="button"
      >
        <span aria-hidden="true">⚙</span> Settings
      </button>
    </aside>
  );
}

