import { escapeHtml, money, num } from '@core/format';
import { cellEconomics, rampSpend, rampSteps } from '@domain/restart/economics';
import type { Lane } from '@domain/restart/types';
import { getState } from './state.js';

function benchmarkNote(cells: number, maxCells: number, clears: boolean): string {
  if (clears) return 'Arithmetic clears the planning benchmark. Actual delivery may differ.';
  const remedy =
    maxCells > 0
      ? `${maxCells} cell${maxCells === 1 ? '' : 's'} would clear.`
      : 'No cell count clears at this budget.';
  return `Below the 50/week planning benchmark at ${cells} cells. ${remedy}`;
}

const laneRow = (lane: Lane): string => {
  const s = getState();
  const cfg = s.lanes[lane];
  const daily = s.ramp[s.week - 1] ?? 0;
  const e = cellEconomics(daily, s.cells, cfg.targetCpa);

  return `
    <article class="panel">
      <h3>${escapeHtml(cfg.name)}</h3>
      <dl class="stats">
        <div><dt>Daily budget</dt><dd>${money(e.daily)}</dd></div>
        <div><dt>Per cell</dt><dd>${money(e.perCell)}</dd></div>
        <div><dt>Orders / cell / week</dt><dd>${e.weeklyOrders.toFixed(1)}</dd></div>
        <div><dt>Cells at benchmark</dt><dd>${e.maxCells}</dd></div>
      </dl>
      <p class="${e.clearsBenchmark ? 'ok' : 'warn'}">
        ${benchmarkNote(s.cells, e.maxCells, e.clearsBenchmark)}
            </p>
    </article>`;
};

export function renderRestart(): string {
  const s = getState();
  const steps = rampSteps(s.ramp);
  const spend = rampSpend(s.ramp, 30, 2).spendOverDays;

  return `
    <h2>Restart · cell economics</h2>
    <div class="grid">${(Object.keys(s.lanes) as Lane[]).map(laneRow).join('')}</div>
    <h3>Ramp</h3>
    <table>
      <thead><tr><th>Week</th><th>Daily / product</th><th>Increase</th></tr></thead>
      <tbody>
        ${steps
          .map(
            (st) => `<tr>
              <td>${st.week}</td>
              <td>${money(st.dailyPerProduct)}</td>
              <td>${st.increaseFromPrevious === null ? '—' : `+${(st.increaseFromPrevious * 100).toFixed(1)}%`}</td>
            </tr>`,
          )
          .join('')}
      </tbody>
    </table>
    <p>Thirty-day ramp spend across both products: <strong>${money(spend)}</strong>
    (${num(spend)} exact). Catalog costs are budgeted separately.</p>`;
}
