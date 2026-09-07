import type { CellEconomics, RampStep, RampSummary } from './types.js';

/**
 * Meta's stated learning-phase reference of roughly 50 conversions per ad set
 * per week. Treated throughout as a planning benchmark, never as proof of
 * stable delivery or of statistical power.
 */
export const PLANNING_BENCHMARK_WEEKLY_ORDERS = 50;

const DAYS_PER_WEEK = 7;

/**
 * Cell-level economics for one product campaign.
 *
 * @param daily     Daily budget for the product campaign.
 * @param cells     Number of ABO cells the budget is split across.
 * @param targetCpa Target cost per acquisition.
 * @param benchmark Weekly-order benchmark. Overridable for sensitivity work.
 */
export function cellEconomics(
  daily: number,
  cells: number,
  targetCpa: number,
  benchmark: number = PLANNING_BENCHMARK_WEEKLY_ORDERS,
): CellEconomics {
  if (!Number.isFinite(daily) || daily < 0)
    throw new RangeError('daily must be a non-negative number');
  if (!Number.isInteger(cells) || cells < 1)
    throw new RangeError('cells must be a positive integer');
  if (!Number.isFinite(targetCpa) || targetCpa <= 0)
    throw new RangeError('targetCpa must be positive');
  if (!Number.isFinite(benchmark) || benchmark <= 0)
    throw new RangeError('benchmark must be positive');

  const perCell = daily / cells;
  const weeklyOrders = (perCell * DAYS_PER_WEEK) / targetCpa;

  return {
    daily,
    perCell,
    weeklyOrders,
    maxCells: Math.floor((daily * DAYS_PER_WEEK) / (benchmark * targetCpa)),
    clearsBenchmark: weeklyOrders >= benchmark,
  };
}

/**
 * The largest cell count that still clears the benchmark, or 0 when even a
 * single cell falls short.
 */
export function maxViableCells(
  daily: number,
  targetCpa: number,
  benchmark: number = PLANNING_BENCHMARK_WEEKLY_ORDERS,
): number {
  return cellEconomics(daily, 1, targetCpa, benchmark).maxCells;
}

/**
 * Ramp steps with the real percentage increase between them.
 *
 * The restart plan described every step as +50%. It is not:
 * 600 -> 900 -> 1200 -> 1500 is +50%, +33.3%, +25%.
 */
export function rampSteps(budgets: readonly number[]): readonly RampStep[] {
  return budgets.map((dailyPerProduct, i) => {
    const previous = i > 0 ? budgets[i - 1] : undefined;
    return {
      week: i + 1,
      dailyPerProduct,
      increaseFromPrevious:
        previous !== undefined && previous > 0 ? dailyPerProduct / previous - 1 : null,
    };
  });
}

/**
 * Total spend across a ramp for a given number of days and products.
 * Each budget holds for seven days; the final budget covers the remainder.
 */
export function rampSpend(budgets: readonly number[], days: number, products: number): RampSummary {
  if (!Number.isInteger(days) || days < 0)
    throw new RangeError('days must be a non-negative integer');
  if (!Number.isInteger(products) || products < 1)
    throw new RangeError('products must be a positive integer');

  let remaining = days;
  let total = 0;

  for (const [i, budget] of budgets.entries()) {
    if (remaining <= 0) break;
    const isLast = i === budgets.length - 1;
    const span = isLast ? remaining : Math.min(DAYS_PER_WEEK, remaining);
    total += budget * span * products;
    remaining -= span;
  }

  return { steps: rampSteps(budgets), spendOverDays: total };
}
