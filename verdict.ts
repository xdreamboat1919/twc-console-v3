/**
 * Creative classification.
 *
 * Two of the six verdicts are deliberately not creative verdicts. When cost per
 * add to cart sits at benchmark and the conversion does not follow, the creative
 * delivered qualified traffic and something downstream lost it. Killing the asset
 * removes working creative and leaves the actual problem untouched.
 */
export type Verdict =
  | 'scale'
  | 'iterate'
  | 'retest'
  | 'kill'
  | 'support'
  | 'destination'
  | 'checkout';

export interface CreativeMetrics {
  readonly spend: number;
  readonly addToCarts: number;
  readonly checkoutsInitiated: number;
  readonly purchases: number;
  readonly linkClickRatePct: number;
}

export interface VerdictThresholds {
  readonly targetCpa: number;
  /** Minimum spend for a read, as a multiple of target CPA. */
  readonly minimumReadMultiple: number;
  /** Expected cost per add to cart as a fraction of target CPA. */
  readonly atcCostRatio: number;
  /** Expected cost per checkout initiated as a fraction of target CPA. */
  readonly icCostRatio: number;
  /** Tolerance above the expected ratio before a step is judged over benchmark. */
  readonly tolerance: number;
  readonly ctrFloorPct: number;
}

export const DEFAULT_THRESHOLDS: VerdictThresholds = {
  targetCpa: 120,
  minimumReadMultiple: 3,
  atcCostRatio: 0.38,
  icCostRatio: 0.6,
  tolerance: 0.15,
  ctrFloorPct: 1.2,
};

export interface VerdictResult {
  readonly verdict: Verdict;
  readonly isCreativeVerdict: boolean;
  readonly reason: string;
  readonly costPerAddToCart: number | null;
  readonly costPerCheckout: number | null;
  readonly cpa: number | null;
}

const ratio = (spend: number, count: number): number | null => (count > 0 ? spend / count : null);

export function classify(
  m: CreativeMetrics,
  t: VerdictThresholds = DEFAULT_THRESHOLDS,
): VerdictResult {
  const minimumRead = t.targetCpa * t.minimumReadMultiple;
  const cpa = ratio(m.spend, m.purchases);
  const cpAtc = ratio(m.spend, m.addToCarts);
  const cpIc = ratio(m.spend, m.checkoutsInitiated);
  const atcBenchmark = t.targetCpa * t.atcCostRatio * (1 + t.tolerance);
  const icBenchmark = t.targetCpa * t.icCostRatio * (1 + t.tolerance);
  const base = { costPerAddToCart: cpAtc, costPerCheckout: cpIc, cpa };

  if (m.spend < minimumRead) {
    return {
      ...base,
      verdict: 'retest',
      isCreativeVerdict: true,
      reason: `Below the ${minimumRead.toFixed(0)} minimum read. A verdict here judges noise.`,
    };
  }

  if (cpa !== null && cpa <= t.targetCpa) {
    return {
      ...base,
      verdict: 'scale',
      isCreativeVerdict: true,
      reason: 'At or below target. Verify orders shipped before graduating.',
    };
  }

  const atcAtBenchmark = cpAtc !== null && cpAtc <= atcBenchmark;
  const icAtBenchmark = cpIc !== null && cpIc <= icBenchmark;

  if (atcAtBenchmark && icAtBenchmark) {
    return {
      ...base,
      verdict: 'checkout',
      isCreativeVerdict: false,
      reason: 'Both upstream costs at benchmark. Everything worked until checkout.',
    };
  }

  if (atcAtBenchmark) {
    return {
      ...base,
      verdict: 'destination',
      isCreativeVerdict: false,
      reason: 'Cost per add to cart at benchmark. The creative delivered; the page lost it.',
    };
  }

  if (m.purchases === 0 && m.linkClickRatePct >= t.ctrFloorPct + 0.2) {
    return {
      ...base,
      verdict: 'support',
      isCreativeVerdict: true,
      reason: 'No attributed conversions with strong CTR. Judge on an account-level pause test.',
    };
  }

  if (m.linkClickRatePct >= t.ctrFloorPct) {
    return {
      ...base,
      verdict: 'iterate',
      isCreativeVerdict: true,
      reason: 'Engagement holds and conversion does not. New hook or format, same concept.',
    };
  }

  return {
    ...base,
    verdict: 'kill',
    isCreativeVerdict: true,
    reason: 'Past the read with weak engagement. The failure is at the layer the asset controls.',
  };
}
