import type { JSX } from 'react';
import { campaigns } from '../data.js';

export function CampaignHealth(): JSX.Element {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">Campaign health</h2>
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
          type="button"
        >
          View all campaigns →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {['Campaign', 'Status', 'Spend', 'Orders', 'CPA', 'ROAS', 'Notes'].map((heading) => (
                <th className="px-5 py-3 font-medium" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((campaign) => (
              <tr key={campaign.name}>
                <td className="px-5 py-4 font-medium text-slate-900">{campaign.name}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${campaign.tone === 'healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-5 py-4 tabular-nums text-slate-700">{campaign.spend}</td>
                <td className="px-5 py-4 tabular-nums text-slate-700">{campaign.orders}</td>
                <td className="px-5 py-4 tabular-nums text-slate-700">{campaign.cpa}</td>
                <td className="px-5 py-4 tabular-nums text-slate-700">{campaign.roas}</td>
                <td className="px-5 py-4 text-slate-500">{campaign.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
