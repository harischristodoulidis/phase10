import { describe, expect, it } from 'vite-plus/test';

import { createRng, nextSeed } from './rng';

function take(count: number, seed: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng());
}

describe('createRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(20, 42)).toEqual(take(20, 42));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(20, 1)).not.toEqual(take(20, 2));
  });

  it('returns values in [0, 1)', () => {
    for (const value of take(1000, 7)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('nextSeed', () => {
  it('returns a deterministic unsigned 32-bit integer', () => {
    const seed = nextSeed(createRng(42));

    expect(seed).toBe(nextSeed(createRng(42)));
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });
});
