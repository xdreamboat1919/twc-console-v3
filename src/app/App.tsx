import { type JSX, useState } from 'react';
import { CampaignHealth } from './components/CampaignHealth.js';
import { Copilot } from './components/Copilot.js';
import { MetricCard } from './components/MetricCard.js';
import { Sidebar } from './components/Sidebar.js';
import { SpendChart } from './components/SpendChart.js';
import { metrics } from './data.js';

export function App(): JSX.Element {
  const [activeView, setActiveView] = useState<'overview' | 'core'>('overview');
  const [coreSection, setCoreSection] = useState('routine');

  function openCore(section: string): void {
    setCoreSection(section);
    setActiveView('core');
  }

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-slate-900 lg:flex">
      <Sidebar
        activeView={activeView}
        onOpenCore={openCore}
        onOpenOverview={() => setActiveView('overview')}
      />
      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 lg:px-9">
          <p className="text-sm font-medium text-slate-500">Private workspace · Local data</p>
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              type="button"
            >
              May 12 – May 18, 2025⌄
            </button>
            <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              Local status: ready
            </span>
          </div>
        </header>
        {activeView === 'overview' ? (
          <div className="mx-auto max-w-7xl space-y-5 px-6 py-7 lg:px-9">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Campaign overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                The signals that matter before you make the next change.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard
                  change={metric.change}
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))}
            </div>
            <SpendChart />
            <CampaignHealth />
            <Copilot />
          </div>
        ) : (
          <section className="h-[calc(100vh-73px)] bg-white p-3 sm:p-5">
            <iframe
              className="size-full rounded-xl border border-slate-200"
              key={coreSection}
              src={`./core/index.html#${coreSection}`}
              title="Campaign Console core workspace"
            />
          </section>
        )}
      </main>
    </div>
  );
}

