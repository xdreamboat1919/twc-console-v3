import { describe, expect, it } from 'vitest';
import { evaluateGate } from './gate.js';
import type { GateEvidence } from './types.js';

const passing: GateEvidence = {
  consecutiveDaysAtTarget: 14,
  reconciliationDeltaPct: 8.2,
  validatedCreativesPerProduct: 2,
  disapprovals: 0,
  dailyHealthRecords: 90,
};

describe('evaluateGate', () => {
  it('passes only when every condition holds', () => {
    expect(evaluateGate(passing).passed).toBe(true);
    expect(evaluateGate(passing).failed).toHaveLength(0);
  });

  it('fails on a single disapproval regardless of everything else', () => {
    const r = evaluateGate({ ...passing, disapprovals: 1 });
    expect(r.passed).toBe(false);
    expect(r.failed.map((f) => f.id)).toEqual(['zero-disapprovals']);
  });

  it('treats reconciliation as an absolute delta in either direction', () => {
    expect(evaluateGate({ ...passing, reconciliationDeltaPct: -14.9 }).passed).toBe(true);
    expect(evaluateGate({ ...passing, reconciliationDeltaPct: -15.1 }).passed).toBe(false);
  });

  it('fails when evidence is incomplete, rather than passing by default', () => {
    const r = evaluateGate({ ...passing, dailyHealthRecords: 61 });
    expect(r.passed).toBe(false);
    expect(r.failed.map((f) => f.id)).toContain('evidence-complete');
  });

  it('reports every failing condition, not just the first', () => {
    const r = evaluateGate({
      consecutiveDaysAtTarget: 3,
      reconciliationDeltaPct: 41,
      validatedCreativesPerProduct: 0,
      disapprovals: 2,
      dailyHealthRecords: 12,
    });
    expect(r.failed).toHaveLength(5);
  });
});
