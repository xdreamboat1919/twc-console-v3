import { describe, expect, it } from 'vitest';
import { type CreativeMetrics, DEFAULT_THRESHOLDS, classify } from './verdict.js';

const base: CreativeMetrics = {
  spend: 500,
  addToCarts: 12,
  checkoutsInitiated: 7,
  purchases: 4,
  linkClickRatePct: 1.8,
};

describe('classify', () => {
  it('returns retest below the minimum read, whatever the numbers say', () => {
    const r = classify({ ...base, spend: 200, purchases: 0 });
    expect(r.verdict).toBe('retest');
  });

  it('returns scale at or below target', () => {
    expect(classify({ ...base, spend: 400, purchases: 4 }).verdict).toBe('scale');
  });

  it('returns kill when engagement is weak past the read', () => {
    const r = classify({
      ...base,
      spend: 600,
      addToCarts: 2,
      checkoutsInitiated: 0,
      purchases: 0,
      linkClickRatePct: 0.4,
    });
    expect(r.verdict).toBe('kill');
    expect(r.isCreativeVerdict).toBe(true);
  });
});

describe('the two verdicts that are not creative verdicts', () => {
  it('returns destination when add to cart is efficient and checkout is not', () => {
    const r = classify({
      spend: 500,
      addToCarts: 12,
      checkoutsInitiated: 4,
      purchases: 0,
      linkClickRatePct: 1.9,
    });
    expect(r.verdict).toBe('destination');
    expect(r.isCreativeVerdict).toBe(false);
  });

  it('returns checkout when both upstream costs are at benchmark', () => {
    const r = classify({
      spend: 500,
      addToCarts: 12,
      checkoutsInitiated: 8,
      purchases: 1,
      linkClickRatePct: 1.9,
    });
    expect(r.verdict).toBe('checkout');
    expect(r.isCreativeVerdict).toBe(false);
  });

  it('never kills an asset whose add to cart cost sits at benchmark', () => {
    const r = classify({
      spend: 600,
      addToCarts: 14,
      checkoutsInitiated: 3,
      purchases: 0,
      linkClickRatePct: 0.3,
    });
    expect(r.verdict).not.toBe('kill');
    expect(r.isCreativeVerdict).toBe(false);
  });
});

describe('thresholds', () => {
  it('scales the minimum read with the lane target', () => {
    const cheap = { ...DEFAULT_THRESHOLDS, targetCpa: 35 };
    // Minimum read at a $35 target is $105, against $360 at the default $120.
    expect(classify({ ...base, spend: 104, purchases: 0 }, cheap).verdict).toBe('retest');
    expect(classify({ ...base, spend: 106, purchases: 0 }, cheap).verdict).not.toBe('retest');
    expect(classify({ ...base, spend: 200, purchases: 0 }).verdict).toBe('retest');
  });

  it('reports null costs rather than dividing by zero', () => {
    const r = classify({
      spend: 500,
      addToCarts: 0,
      checkoutsInitiated: 0,
      purchases: 0,
      linkClickRatePct: 0.1,
    });
    expect(r.costPerAddToCart).toBeNull();
    expect(r.cpa).toBeNull();
  });
});

describe('the engagement-based verdicts', () => {
  it('returns support when CTR is strong and nothing converted', () => {
    const r = classify({
      spend: 600,
      addToCarts: 4,
      checkoutsInitiated: 1,
      purchases: 0,
      linkClickRatePct: 1.6,
    });
    expect(r.verdict).toBe('support');
    expect(r.reason).toContain('pause test');
  });

  it('returns iterate when engagement holds but conversion does not', () => {
    const r = classify({
      spend: 600,
      addToCarts: 5,
      checkoutsInitiated: 3,
      purchases: 2,
      linkClickRatePct: 1.3,
    });
    expect(r.verdict).toBe('iterate');
    expect(r.isCreativeVerdict).toBe(true);
  });
});
