import type { JSX } from 'react';

export type WorkspaceView =
  | 'overview'
  | 'campaigns'
  | 'adsets'
  | 'creatives'
  | 'audiences'
  | 'reports'
  | 'experiments'
  | 'alerts'
  | 'notes'
  | 'settings';

interface SidebarProps {
  readonly activeView: WorkspaceView;
  readonly onSelect: (view: WorkspaceView) => void;
}

const items: readonly {
  readonly id: WorkspaceView;
  readonly icon: string;
  readonly label: string;
}[] = [
  { id: 'overview', icon: '⌂', label: 'Overview' },
  { id: 'campaigns', icon: '◌', label: 'Campaigns' },
  { id: 'adsets', icon: '≡', label: 'Ad sets' },
  { id: 'creatives', icon: '✦', label: 'Creatives' },
  { id: 'audiences', icon: '◎', label: 'Audiences' },
  { id: 'reports', icon: '↗', label: 'Reports' },
  { id: 'experiments', icon: '⚗', label: 'Experiments' },
  { id: 'alerts', icon: '!', label: 'Alerts' },
  { id: 'notes', icon: '▤', label: 'Notes' },
];

export function Sidebar({ activeView, onSelect }: SidebarProps): JSX.Element {
  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#08213f] px-3 py-4 text-slate-200 lg:sticky lg:top-0 lg:h-screen lg:w-60">
      <div className="px-3 pb-4 text-lg font-bold tracking-tight text-white">
        TWC Campaign Console
      </div>
      <nav
        className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible"
        aria-label="Workspace navigation"
      >
        {items.map((item) => (
          <button
            aria-current={activeView === item.id ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition lg:w-full ${
              activeView === item.id
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            key={item.id}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <span aria-hidden="true" className="grid size-5 place-items-center text-base">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
      <button
        className={`mt-2 flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition lg:mt-auto lg:w-full ${
          activeView === 'settings'
            ? 'bg-white/15 text-white shadow-sm'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => onSelect('settings')}
        type="button"
      >
        <span aria-hidden="true" className="grid size-5 place-items-center text-base">
          ⚙
        </span>
        Settings
      </button>
    </aside>
  );
}

