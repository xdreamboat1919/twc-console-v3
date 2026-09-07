/** Marginal efficiency of a budget increment. Blended figures hide decay; this does not. */

export interface Increment {
  readonly spendBefore: number;
  readonly conversionsBefore: number;
  readonly spendAfter: number;
  readonly conversionsAfter: number;
}

export type MarginalVerdict = 'efficient' | 'ceiling-approaching' | 'past-ceiling' | 'no-return';

export interface MarginalResult {
  readonly blendedBefore: number | null;
  readonly blendedAfter: number | null;
  /** Cost of the additional conversions alone. Null when none were gained. */
  readonly marginalCpa: number | null;
  readonly additionalConversions: number;
  readonly verdict: MarginalVerdict;
  readonly recommendation: string;
}

export function marginalCpa(i: Increment, targetCpa: number): MarginalResult {
  if (!Number.isFinite(targetCpa) || targetCpa <= 0) {
    throw new RangeError('targetCpa must be positive');
  }

  const deltaSpend = i.spendAfter - i.spendBefore;
  const deltaConv = i.conversionsAfter - i.conversionsBefore;
  const blendedBefore = i.conversionsBefore > 0 ? i.spendBefore / i.conversionsBefore : null;
  const blendedAfter = i.conversionsAfter > 0 ? i.spendAfter / i.conversionsAfter : null;

  if (deltaConv <= 0) {
    return {
      blendedBefore,
      blendedAfter,
      marginalCpa: null,
      additionalConversions: deltaConv,
      verdict: 'no-return',
      recommendation:
        'The increment bought no additional conversions. Reverse it and add creative instead.',
    };
  }

  const marginal = deltaSpend / deltaConv;
  const verdict: MarginalVerdict =
    marginal <= targetCpa
      ? 'efficient'
      : marginal <= targetCpa * 1.4
        ? 'ceiling-approaching'
        : 'past-ceiling';

  const recommendation = {
    efficient: 'Still efficient. Wait the cooldown, then consider a further step.',
    'ceiling-approaching':
      'The aggregate is starting to hide the decay. Hold budget and add validated creative.',
    'past-ceiling': 'Every additional dollar is materially less efficient. Roll back.',
    'no-return': '',
  }[verdict];

  return {
    blendedBefore,
    blendedAfter,
    marginalCpa: marginal,
    additionalConversions: deltaConv,
    verdict,
    recommendation,
  };
}
