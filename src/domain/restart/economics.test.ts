import { describe, expect, it } from 'vitest';
import { cellEconomics, maxViableCells, rampSpend, rampSteps } from './economics.js';

const RAMP = [600, 900, 1200, 1500] as const;
const SKINCARE_CPA = 35;
const KIT_CPA = 90;

describe('cellEconomics', () => {
  it('splits budget evenly and derives weekly orders', () => {
    const e = cellEconomics(1500, 4, SKINCARE_CPA);
    expect(e.perCell).toBe(375);
    expect(e.weeklyOrders).toBeCloseTo(75, 5);
    expect(e.clearsBenchmark).toBe(true);
  });

  it('rejects invalid input rather than returning NaN', () => {
    expect(() => cellEconomics(-1, 4, 35)).toThrow(RangeError);
    expect(() => cellEconomics(1500, 0, 35)).toThrow(RangeError);
    expect(() => cellEconomics(1500, 4, 0)).toThrow(RangeError);
    expect(() => cellEconomics(1500, 2.5, 35)).toThrow(RangeError);
  });

  it('honours an overridden benchmark', () => {
    expect(cellEconomics(1500, 4, KIT_CPA, 25).clearsBenchmark).toBe(true);
    expect(cellEconomics(1500, 4, KIT_CPA, 50).clearsBenchmark).toBe(false);
  });
});

describe('the kit four-cell finding', () => {
  it('never clears the benchmark at any point in the ramp', () => {
    for (const daily of RAMP) {
      expect(cellEconomics(daily, 4, KIT_CPA).clearsBenchmark).toBe(false);
    }
  });

  it('reaches only 29.2 orders per week at full budget', () => {
    expect(cellEconomics(1500, 4, KIT_CPA).weeklyOrders).toBeCloseTo(29.17, 2);
  });

  it('clears at two cells on full budget', () => {
    const e = cellEconomics(1500, 2, KIT_CPA);
    expect(e.weeklyOrders).toBeCloseTo(58.33, 2);
    expect(e.clearsBenchmark).toBe(true);
  });

  it('would need roughly $2,571 daily to clear at four cells', () => {
    expect(cellEconomics(2572, 4, KIT_CPA).clearsBenchmark).toBe(true);
    expect(cellEconomics(2570, 4, KIT_CPA).clearsBenchmark).toBe(false);
  });
});

describe('skincare during the ramp', () => {
  it('is below benchmark in weeks one and two, clears from week three', () => {
    const results = RAMP.map((d) => cellEconomics(d, 4, SKINCARE_CPA).clearsBenchmark);
    expect(results).toEqual([false, false, true, true]);
  });
});

describe('maxViableCells', () => {
  it('reports six for skincare and two for the kit at full budget', () => {
    expect(maxViableCells(1500, SKINCARE_CPA)).toBe(6);
    expect(maxViableCells(1500, KIT_CPA)).toBe(2);
  });

  it('reports zero when a single cell cannot clear', () => {
    expect(maxViableCells(100, KIT_CPA)).toBe(0);
  });
});

describe('rampSteps', () => {
  it('reports the real increases, which are not all fifty percent', () => {
    const steps = rampSteps(RAMP);
    expect(steps[0]?.increaseFromPrevious).toBeNull();
    expect(steps[1]?.increaseFromPrevious).toBeCloseTo(0.5, 5);
    expect(steps[2]?.increaseFromPrevious).toBeCloseTo(1 / 3, 5);
    expect(steps[3]?.increaseFromPrevious).toBeCloseTo(0.25, 5);
  });
});

describe('rampSpend', () => {
  it('matches the published thirty-day figure for two products', () => {
    expect(rampSpend(RAMP, 30, 2).spendOverDays).toBe(64_800);
  });

  it('holds the final budget for the remainder of the period', () => {
    expect(rampSpend(RAMP, 60, 2).spendOverDays).toBe(64_800 + 30 * 1500 * 2);
  });

  it('handles a period shorter than the ramp', () => {
    expect(rampSpend(RAMP, 7, 1).spendOverDays).toBe(4200);
  });

  it('returns zero for a zero-day period', () => {
    expect(rampSpend(RAMP, 0, 2).spendOverDays).toBe(0);
  });
});
