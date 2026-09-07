import type { JSX } from 'react';

const points = '0,135 72,112 144,74 216,93 288,56 360,82 432,116 504,98 576,58 648,76';

export function SpendChart(): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-950">Spend over time</h2>
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
          type="button"
        >
          Daily⌄
        </button>
      </div>
      <svg
        aria-label="Spend trend from May 12 to May 18"
        className="mt-5 h-48 w-full"
        role="img"
        viewBox="0 0 648 180"
      >
        {[40, 80, 120, 160].map((y) => (
          <line key={y} stroke="#e2e8f0" strokeDasharray="3 4" x1="0" x2="648" y1={y} y2={y} />
        ))}
        <polyline
          fill="none"
          points={points}
          stroke="#2563eb"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {points.split(' ').map((point) => {
          const [cx, cy] = point.split(',');
          return <circle cx={cx} cy={cy} fill="#2563eb" key={point} r="4" />;
        })}
      </svg>
      <div className="flex justify-between text-xs text-slate-400">
        {['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </section>
  );
}
