import { describe, expect, it } from 'vitest';
import { defaults, migrate } from './state.js';

describe('migrate', () => {
  it('falls back to defaults on unusable input', () => {
    expect(migrate(null)).toEqual(defaults());
    expect(migrate('nonsense')).toEqual(defaults());
    expect(migrate(42)).toEqual(defaults());
  });

  it('carries a valid v2 ramp forward', () => {
    expect(migrate({ ramp: [500, 800, 1100, 1400] }).ramp).toEqual([500, 800, 1100, 1400]);
  });

  it('rejects an odd or out-of-range asset count', () => {
    expect(migrate({ assetsPerCell: 7 }).assetsPerCell).toBe(6);
    expect(migrate({ assetsPerCell: 20 }).assetsPerCell).toBe(6);
    expect(migrate({ assetsPerCell: 8 }).assetsPerCell).toBe(8);
  });
});
