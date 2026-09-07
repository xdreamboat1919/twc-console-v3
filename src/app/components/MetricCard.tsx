import type { JSX } from 'react';

interface MetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly change: string;
}

export function MetricCard({ label, value, change }: MetricCardProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm text-emerald-700">
        ↑ {change} <span className="text-slate-400">vs May 5 – May 11</span>
      </p>
    </article>
  );
}
