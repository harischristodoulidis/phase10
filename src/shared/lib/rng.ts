export type Rng = () => number;

const UINT32_RANGE = 2 ** 32;

// mulberry32
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

export function nextSeed(rng: Rng): number {
  return Math.floor(rng() * UINT32_RANGE);
}
