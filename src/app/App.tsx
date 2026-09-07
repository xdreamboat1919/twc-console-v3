import { type FormEvent, type JSX, useEffect, useMemo, useState } from 'react';
import { Copilot } from './components/Copilot.js';
import { Sidebar, type WorkspaceView } from './components/Sidebar.js';

type CampaignStatus = 'Active' | 'Paused';
type ExperimentStatus = 'Planned' | 'Running' | 'Complete';

interface Campaign {
  readonly id: number;
  readonly name: string;
  readonly channel: string;
  readonly spend: number;
  readonly revenue: number;
  readonly status: CampaignStatus;
}

interface Experiment {
  readonly id: number;
  readonly name: string;
  readonly status: ExperimentStatus;
}

interface Alert {
  readonly id: number;
  readonly text: string;
}

interface Workspace {
  readonly campaigns: readonly Campaign[];
  readonly experiments: readonly Experiment[];
  readonly audiences: readonly string[];
  readonly alerts: readonly Alert[];
  readonly notes: readonly string[];
}

const storageKey = 'twc-console-workspace-v4';
const initialWorkspace: Workspace = {
  campaigns: [
    {
      id: 1,
      name: 'Skincare hero',
      channel: 'Meta',
      spend: 9842,
      revenue: 41431,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Preparedness kit',
      channel: 'Google',
      spend: 8900,
      revenue: 30349,
      status: 'Active',
    },
  ],
  experiments: [{ id: 1, name: 'Creator-led landing page', status: 'Running' }],
  audiences: ['High-intent site visitors', 'Past purchasers – 180 days'],
  alerts: [
    { id: 1, text: 'Preparedness kit CPA rose 11% this week.' },
    { id: 2, text: 'Skincare hero needs new creative within three days.' },
  ],
  notes: ['Review Preparedness kit landing-page speed before increasing budget.'],
};

const headings: Record<WorkspaceView, readonly [string, string]> = {
  overview: ['Campaign overview', 'Your operating picture, in one place.'],
  campaigns: ['Campaigns', 'Manage the work that drives your account.'],
  adsets: ['Ad sets', 'Review delivery groups and allocation.'],
  creatives: ['Creatives', 'Keep fresh creative moving into testing.'],
  audiences: ['Audiences', 'Maintain the audiences used across campaigns.'],
  reports: ['Reports', 'Export a portable snapshot of this local workspace.'],
  experiments: ['Experiments', 'Plan, run, and close controlled tests.'],
  alerts: ['Alerts', 'Resolve attention items once they have an owner.'],
  notes: ['Notes', 'Keep decisions and context beside the work.'],
  settings: ['Settings', 'Private workspace settings.'],
};

function money(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function loadWorkspace(): Workspace {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as Workspace) : initialWorkspace;
  } catch {
    return initialWorkspace;
  }
}

function Panel({
  children,
  className = '',
}: {
  readonly children: JSX.Element | readonly JSX.Element[];
  readonly className?: string;
}): JSX.Element {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  note,
}: { readonly label: string; readonly value: string; readonly note: string }): JSX.Element {
  return (
    <Panel>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-medium text-emerald-700">{note}</p>
    </Panel>
  );
}

export function App(): JSX.Element {
  const [view, setView] = useState<WorkspaceView>('overview');
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [notice, setNotice] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [spend, setSpend] = useState('');
  const [revenue, setRevenue] = useState('');
  const [audience, setAudience] = useState('');
  const [experiment, setExperiment] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [workspace]);

  const totals = useMemo(() => {
    const active = workspace.campaigns.filter((campaign) => campaign.status === 'Active');
    const totalSpend = active.reduce((sum, campaign) => sum + campaign.spend, 0);
    const totalRevenue = active.reduce((sum, campaign) => sum + campaign.revenue, 0);
    return { active, totalSpend, totalRevenue, roas: totalSpend ? totalRevenue / totalSpend : 0 };
  }, [workspace.campaigns]);

  function toast(message: string): void {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  }

  function toggleCampaign(id: number): void {
    setWorkspace((current) => ({
      ...current,
      campaigns: current.campaigns.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status: campaign.status === 'Active' ? 'Paused' : 'Active' }
          : campaign,
      ),
    }));
  }

  function addCampaign(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsedSpend = Number(spend);
    const parsedRevenue = Number(revenue);
    if (!campaignName.trim() || !Number.isFinite(parsedSpend) || !Number.isFinite(parsedRevenue)) {
      toast('Enter a campaign name, spend, and revenue.');
      return;
    }
    setWorkspace((current) => ({
      ...current,
      campaigns: [
        ...current.campaigns,
        {
          id: Date.now(),
          name: campaignName.trim(),
          channel: 'Meta',
          spend: parsedSpend,
          revenue: parsedRevenue,
          status: 'Active',
        },
      ],
    }));
    setCampaignName('');
    setSpend('');
    setRevenue('');
    toast('Campaign added.');
  }

  function addAudience(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!audience.trim()) return;
    setWorkspace((current) => ({ ...current, audiences: [...current.audiences, audience.trim()] }));
    setAudience('');
    toast('Audience saved.');
  }

  function addExperiment(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!experiment.trim()) return;
    setWorkspace((current) => ({
      ...current,
      experiments: [
        ...current.experiments,
        { id: Date.now(), name: experiment.trim(), status: 'Planned' },
      ],
    }));
    setExperiment('');
    toast('Experiment saved.');
  }

  function advanceExperiment(id: number): void {
    const next: Record<ExperimentStatus, ExperimentStatus> = {
      Planned: 'Running',
      Running: 'Complete',
      Complete: 'Planned',
    };
    setWorkspace((current) => ({
      ...current,
      experiments: current.experiments.map((item) =>
        item.id === id ? { ...item, status: next[item.status] } : item,
      ),
    }));
  }

  function resolveAlert(id: number): void {
    setWorkspace((current) => ({
      ...current,
      alerts: current.alerts.filter((alert) => alert.id !== id),
    }));
    toast('Alert resolved.');
  }

  function addNote(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!note.trim()) return;
    setWorkspace((current) => ({ ...current, notes: [note.trim(), ...current.notes] }));
    setNote('');
    toast('Note saved.');
  }

  function exportWorkspace(): void {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'twc-console-workspace.json';
    link.click();
    URL.revokeObjectURL(url);
    toast('Workspace export started.');
  }

  function renderOverview(): JSX.Element {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Active spend"
            value={money(totals.totalSpend)}
            note={`${totals.active.length} active campaigns`}
          />
          <Metric
            label="Revenue"
            value={money(totals.totalRevenue)}
            note="Local workspace estimate"
          />
          <Metric
            label="Blended ROAS"
            value={`${totals.roas.toFixed(2)}×`}
            note="Revenue ÷ active spend"
          />
          <Metric
            label="Open alerts"
            value={String(workspace.alerts.length)}
            note="Review before budget changes"
          />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Campaign health</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A clear read before your next decision.
                </p>
              </div>
              <button
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => setView('campaigns')}
                type="button"
              >
                Manage campaigns
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {workspace.campaigns.map((campaign) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                  key={campaign.id}
                >
                  <div>
                    <p className="font-medium text-slate-900">{campaign.name}</p>
                    <p className="text-sm text-slate-500">
                      {campaign.channel} · {money(campaign.spend)} spend ·{' '}
                      {(campaign.revenue / campaign.spend).toFixed(2)}× ROAS
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Priority queue</h2>
                <p className="mt-1 text-sm text-slate-500">What needs attention now.</p>
              </div>
              <button
                className="text-sm font-semibold text-blue-700"
                onClick={() => setView('alerts')}
                type="button"
              >
                Open alerts
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {workspace.alerts.map((alert) => (
                <div
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                  key={alert.id}
                >
                  {alert.text}
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <Copilot />
      </div>
    );
  }

  function renderCampaigns(): JSX.Element {
    return (
      <div className="space-y-5">
        <Panel className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Campaign</th>
                  <th className="px-5 py-4">Spend</th>
                  <th className="px-5 py-4">Revenue</th>
                  <th className="px-5 py-4">ROAS</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspace.campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <p className="text-slate-500">{campaign.channel}</p>
                    </td>
                    <td className="px-5 py-4">{money(campaign.spend)}</td>
                    <td className="px-5 py-4">{money(campaign.revenue)}</td>
                    <td className="px-5 py-4">{(campaign.revenue / campaign.spend).toFixed(2)}×</td>
                    <td className="px-5 py-4">{campaign.status}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50"
                        onClick={() => toggleCampaign(campaign.id)}
                        type="button"
                      >
                        {campaign.status === 'Active' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold text-slate-950">Add campaign</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={addCampaign}>
            <input
              className="rounded-xl border border-slate-300 px-3 py-2.5"
              onChange={(event) => setCampaignName(event.target.value)}
              placeholder="Campaign name"
              value={campaignName}
            />
            <input
              className="rounded-xl border border-slate-300 px-3 py-2.5"
              inputMode="decimal"
              onChange={(event) => setSpend(event.target.value)}
              placeholder="Spend"
              value={spend}
            />
            <input
              className="rounded-xl border border-slate-300 px-3 py-2.5"
              inputMode="decimal"
              onChange={(event) => setRevenue(event.target.value)}
              placeholder="Revenue"
              value={revenue}
            />
            <button
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 md:col-span-3"
              type="submit"
            >
              Save campaign
            </button>
          </form>
        </Panel>
      </div>
    );
  }

  function renderSimpleCards(): JSX.Element {
    const cards =
      view === 'adsets'
        ? workspace.campaigns.map((item) => ({
            title: `${item.name} prospecting`,
            detail: `Daily budget: ${money(Math.round(item.spend / 7))}`,
            action: 'Open campaign',
            target: 'campaigns' as const,
          }))
        : [
            {
              title: 'Creator testimonial',
              detail: 'Testing now',
              action: 'Create test',
              target: 'experiments' as const,
            },
            {
              title: 'Problem–solution video',
              detail: 'Ready for testing',
              action: 'Create test',
              target: 'experiments' as const,
            },
            {
              title: 'Product comparison',
              detail: 'Ready for testing',
              action: 'Create test',
              target: 'experiments' as const,
            },
          ];
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Panel key={card.title}>
            <div className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
              ✦
            </div>
            <h2 className="mt-4 font-semibold text-slate-950">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
            <button
              className="mt-5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              onClick={() => setView(card.target)}
              type="button"
            >
              {card.action}
            </button>
          </Panel>
        ))}
      </div>
    );
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Each explicit branch is a user-visible workspace screen.
  function renderView(): JSX.Element {
    if (view === 'overview') return renderOverview();
    if (view === 'campaigns') return renderCampaigns();
    if (view === 'adsets' || view === 'creatives') return renderSimpleCards();
    if (view === 'audiences')
      return (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <h2 className="text-lg font-semibold text-slate-950">Saved audiences</h2>
            <div className="mt-4 space-y-2">
              {workspace.audiences.map((item) => (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-lg font-semibold text-slate-950">Add audience</h2>
            <form className="mt-4 space-y-3" onSubmit={addAudience}>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Audience name"
                value={audience}
              />
              <button
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                Save audience
              </button>
            </form>
          </Panel>
        </div>
      );
    if (view === 'reports')
      return (
        <Panel>
          <h2 className="text-lg font-semibold text-slate-950">Workspace export</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Download campaigns, experiments, audiences, alerts, and notes as one portable JSON file.
          </p>
          <button
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={exportWorkspace}
            type="button"
          >
            Export workspace
          </button>
        </Panel>
      );
    if (view === 'experiments')
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {workspace.experiments.map((item) => (
              <Panel key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-950">{item.name}</h2>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {item.status}
                  </span>
                </div>
                <button
                  className="mt-5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  onClick={() => advanceExperiment(item.id)}
                  type="button"
                >
                  Advance status
                </button>
              </Panel>
            ))}
          </div>
          <Panel>
            <h2 className="text-lg font-semibold text-slate-950">Create experiment</h2>
            <form className="mt-4 flex flex-wrap gap-3" onSubmit={addExperiment}>
              <input
                className="min-w-60 flex-1 rounded-xl border border-slate-300 px-3 py-2.5"
                onChange={(event) => setExperiment(event.target.value)}
                placeholder="Experiment name"
                value={experiment}
              />
              <button
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                Save experiment
              </button>
            </form>
          </Panel>
        </div>
      );
    if (view === 'alerts')
      return (
        <div className="space-y-3">
          {workspace.alerts.length ? (
            workspace.alerts.map((item) => (
              <Panel key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.text}</p>
                  <button
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                    onClick={() => resolveAlert(item.id)}
                    type="button"
                  >
                    Resolve
                  </button>
                </div>
              </Panel>
            ))
          ) : (
            <Panel>
              <p className="font-semibold text-slate-900">No open alerts.</p>
            </Panel>
          )}
        </div>
      );
    if (view === 'notes')
      return (
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1fr]">
          <Panel>
            <h2 className="text-lg font-semibold text-slate-950">Add note</h2>
            <form className="mt-4 space-y-3" onSubmit={addNote}>
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Record a decision or next step…"
                value={note}
              />
              <button
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                Save note
              </button>
            </form>
          </Panel>
          <div className="space-y-3">
            {workspace.notes.map((item) => (
              <Panel key={item}>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </Panel>
            ))}
          </div>
        </div>
      );
    return (
      <Panel>
        <h2 className="text-lg font-semibold text-slate-950">Local-first workspace</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Your workspace saves automatically in this browser. Export a backup from Reports whenever
          you need one. The campaign copilot only talks to Ollama running on this computer.
        </p>
        <button
          className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
          onClick={() => setView('reports')}
          type="button"
        >
          Open reports
        </button>
      </Panel>
    );
  }

  const [title, detail] = headings[view];
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 lg:flex">
      <Sidebar activeView={view} onSelect={setView} />
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:px-9">
          <p className="text-sm font-medium text-slate-500">
            Private workspace · Saved on this device
          </p>
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            onClick={() => setView('reports')}
            type="button"
          >
            Export
          </button>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-7 lg:px-9">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{detail}</p>
          </div>
          {notice ? (
            <output className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {notice}
            </output>
          ) : null}
          {renderView()}
        </div>
      </main>
    </div>
  );
}

