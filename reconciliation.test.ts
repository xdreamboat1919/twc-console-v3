import { describe, expect, it } from 'vitest';
import { reconcile } from './reconciliation.js';

describe('reconcile', () => {
  it('treats a small delta as normal', () => {
    const r = reconcile({
      platformOrders: 105,
      platformRevenue: 31_500,
      backendOrders: 100,
      backendRevenue: 30_000,
    });
    expect(r.status).toBe('normal');
  });

  it('flags a large delta as a counting fault', () => {
    const r = reconcile({
      platformOrders: 140,
      platformRevenue: 42_000,
      backendOrders: 100,
      backendRevenue: 30_000,
    });
    expect(r.status).toBe('counting-fault');
  });

  it('separates a value fault from a counting fault', () => {
    const r = reconcile({
      platformOrders: 102,
      platformRevenue: 45_000,
      backendOrders: 100,
      backendRevenue: 30_000,
    });
    expect(r.status).toBe('investigate');
    expect(r.likelyCause).toContain('value or currency');
  });

  it('treats the delta as absolute in either direction', () => {
    const under = reconcile({
      platformOrders: 60,
      platformRevenue: 18_000,
      backendOrders: 100,
      backendRevenue: 30_000,
    });
    expect(under.status).toBe('counting-fault');
  });

  it('does not divide by zero on an empty back end', () => {
    const r = reconcile({
      platformOrders: 10,
      platformRevenue: 100,
      backendOrders: 0,
      backendRevenue: 0,
    });
    expect(Number.isFinite(r.orderDeltaPct)).toBe(true);
  });
});

describe('the investigate band', () => {
  it('flags a delta between fifteen and thirty percent for investigation', () => {
    const r = reconcile({
      platformOrders: 122,
      platformRevenue: 36_600,
      backendOrders: 100,
      backendRevenue: 30_000,
    });
    expect(r.status).toBe('investigate');
    expect(r.likelyCause).toContain('window, timezone');
  });
});
