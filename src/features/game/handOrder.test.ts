import { describe, expect, it } from 'vite-plus/test';

import { moveId, nudgeTarget } from './handOrder';

describe('moveId', () => {
  it('moves an id forward and back', () => {
    expect(moveId(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveId(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('keeps the order for a move off either end', () => {
    expect(moveId(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(moveId(['a', 'b'], 1, 2)).toEqual(['a', 'b']);
  });
});

describe('nudgeTarget', () => {
  it('maps the left and right arrows to the neighbouring place', () => {
    expect(nudgeTarget('ArrowLeft', 2)).toBe(1);
    expect(nudgeTarget('ArrowRight', 2)).toBe(3);
    expect(nudgeTarget('ArrowUp', 2)).toBeNull();
  });
});
