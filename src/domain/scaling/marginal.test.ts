import { describe, expect, it } from 'vitest';
import { marginalCpa } from './marginal.js';

describe('marginalCpa', () => {
  it('isolates the cost of the additional conversions', () => {
    const r = marginalCpa(
      { spendBefore: 700, conversionsBefore: 6, spendAfter: 875, conversionsAfter: 7 },
      120,
    );
    expect(r.marginalCpa).toBe(175);
    expect(r.blendedAfter).toBeCloseTo(125, 5);
    expect(r.verdict).toBe('past-ceiling');
  });

  it('shows the blend flattering a bad increment', () => {
    const r = marginalCpa(
      { spendBefore: 1000, conversionsBefore: 10, spendAfter: 1300, conversionsAfter: 11 },
      110,
    );
    expect(r.blendedAfter).toBeLessThan(120);
    expect(r.marginalCpa).toBe(300);
    expect(r.verdict).toBe('past-ceiling');
  });

  it('flags an increment that bought nothing', () => {
    const r = marginalCpa(
      { spendBefore: 900, conversionsBefore: 8, spendAfter: 1200, conversionsAfter: 8 },
      120,
    );
    expect(r.verdict).toBe('no-return');
    expect(r.marginalCpa).toBeNull();
  });

  it('classifies an efficient increment', () => {
    const r = marginalCpa(
      { spendBefore: 900, conversionsBefore: 9, spendAfter: 1125, conversionsAfter: 11.5 },
      120,
    );
    expect(r.verdict).toBe('efficient');
  });

  it('rejects a non-positive target', () => {
    expect(() =>
      marginalCpa({ spendBefore: 1, conversionsBefore: 1, spendAfter: 2, conversionsAfter: 2 }, 0),
    ).toThrow(RangeError);
  });
});
