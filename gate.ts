import type { GateCondition, GateEvidence, GateResult } from './types.js';

export const GATE_MIN_CONSECUTIVE_DAYS = 14;
export const GATE_MAX_RECONCILIATION_DELTA_PCT = 15;
export const GATE_MIN_VALIDATED_CREATIVES = 2;
export const GATE_REQUIRED_HEALTH_RECORDS = 90;

/**
 * The day-90 gate. Four published conditions plus the evidence-completeness
 * check that makes them auditable.
 *
 * Missing evidence fails. A gate that passes on absent data is not a gate.
 */
export function evaluateGate(evidence: GateEvidence): GateResult {
  const conditions: GateCondition[] = [
    {
      id: 'cpa-at-target',
      label: `CPA at or below target for ${GATE_MIN_CONSECUTIVE_DAYS} consecutive days`,
      met: evidence.consecutiveDaysAtTarget >= GATE_MIN_CONSECUTIVE_DAYS,
      detail: `${evidence.consecutiveDaysAtTarget} of ${GATE_MIN_CONSECUTIVE_DAYS} days`,
    },
    {
      id: 'reconciliation',
      label: `Platform and back end reconcile within ${GATE_MAX_RECONCILIATION_DELTA_PCT}%`,
      met: Math.abs(evidence.reconciliationDeltaPct) <= GATE_MAX_RECONCILIATION_DELTA_PCT,
      detail: `${evidence.reconciliationDeltaPct.toFixed(1)}% delta`,
    },
    {
      id: 'creative-depth',
      label: `At least ${GATE_MIN_VALIDATED_CREATIVES} validated creatives per product`,
      met: evidence.validatedCreativesPerProduct >= GATE_MIN_VALIDATED_CREATIVES,
      detail: `${evidence.validatedCreativesPerProduct} validated`,
    },
    {
      id: 'zero-disapprovals',
      label: 'Zero disapprovals across the ninety days',
      met: evidence.disapprovals === 0,
      detail:
        evidence.disapprovals === 0
          ? 'clean record'
          : `${evidence.disapprovals} disapproval${evidence.disapprovals === 1 ? '' : 's'}`,
    },
    {
      id: 'evidence-complete',
      label: `All ${GATE_REQUIRED_HEALTH_RECORDS} daily health records present`,
      met: evidence.dailyHealthRecords >= GATE_REQUIRED_HEALTH_RECORDS,
      detail: `${evidence.dailyHealthRecords} of ${GATE_REQUIRED_HEALTH_RECORDS} recorded`,
    },
  ];

  const failed = conditions.filter((c) => !c.met);
  return { conditions, passed: failed.length === 0, failed };
}
