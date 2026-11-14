import { describe, expect, it } from 'vite-plus/test';

import { applyHit, canHit, orderHits, runRange } from './hit';
import { group, num, nums, skip, wild } from './testUtils';
import type { Card } from './types';

function values(cards: readonly Card[]): (number | 'W')[] {
  return cards.map((card) => (card.kind === 'number' ? card.value : 'W'));
}

describe('runRange', () => {
  it('reads the range from the ordered cards, Wilds included', () => {
    expect(runRange(group('run', nums(4, 5, 6, 7)))).toEqual({ min: 4, max: 7 });
    expect(runRange(group('run', [wild(), wild(), ...nums(5, 6)]))).toEqual({ min: 3, max: 6 });
  });
});

describe('canHit', () => {
  it('lets a set take the same number or a Wild', () => {
    const set = group('set', [wild(), ...nums(7, 7)]);

    expect(canHit(set, num(7, 'blue'))).toBe(true);
    expect(canHit(set, wild())).toBe(true);
    expect(canHit(set, num(8))).toBe(false);
  });

  it('lets a color group take the same color or a Wild', () => {
    const color = group('color', [num(2, 'green'), num(9, 'green')]);

    expect(canHit(color, num(11, 'green'))).toBe(true);
    expect(canHit(color, wild())).toBe(true);
    expect(canHit(color, num(11, 'blue'))).toBe(false);
  });

  it('lets a run grow only at its ends', () => {
    const run = group('run', nums(4, 5, 6, 7));

    expect(canHit(run, num(3))).toBe(true);
    expect(canHit(run, num(8))).toBe(true);
    expect(canHit(run, num(5))).toBe(false);
    expect(canHit(run, num(9))).toBe(false);
  });

  it('counts the values Wilds fill in a run', () => {
    const run = group('run', [wild(), ...nums(4, 5, 6)]);

    expect(canHit(run, num(2))).toBe(true);
    expect(canHit(run, num(3))).toBe(false);
    expect(canHit(run, num(7))).toBe(true);
  });

  it('stops a run at 1 and 12', () => {
    expect(canHit(group('run', nums(1, 2, 3, 4)), num(5))).toBe(true);
    expect(canHit(group('run', nums(9, 10, 11, 12)), num(8))).toBe(true);
    expect(canHit(group('run', nums(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)), wild())).toBe(false);
  });

  it('never accepts a Skip', () => {
    expect(canHit(group('set', nums(7, 7, 7)), skip())).toBe(false);
    expect(canHit(group('run', nums(4, 5, 6, 7)), skip())).toBe(false);
    expect(canHit(group('color', nums(1, 2, 3)), skip())).toBe(false);
  });
});

describe('applyHit', () => {
  it('adds a number to the matching end of a run', () => {
    const run = group('run', nums(4, 5, 6, 7));

    expect(values(applyHit(run, num(3)).cards)).toEqual([3, 4, 5, 6, 7]);
    expect(values(applyHit(run, num(8)).cards)).toEqual([4, 5, 6, 7, 8]);
  });

  it('puts a Wild at the top of a run, or the bottom when the top is 12', () => {
    expect(values(applyHit(group('run', nums(4, 5, 6, 7)), wild()).cards)).toEqual([
      4,
      5,
      6,
      7,
      'W',
    ]);
    expect(values(applyHit(group('run', nums(9, 10, 11, 12)), wild()).cards)).toEqual([
      'W',
      9,
      10,
      11,
      12,
    ]);
  });

  it('adds to the end of a set or color group without changing the input', () => {
    const set = group('set', nums(7, 7, 7));
    const card = num(7);

    expect(applyHit(set, card).cards).toEqual([...set.cards, card]);
    expect(set.cards).toHaveLength(3);
  });
});

describe('orderHits', () => {
  const grown = (start: Card[], type: 'set' | 'run' | 'color', cards: Card[]) => {
    const result = orderHits(group(type, start), cards);
    return result === null ? null : values(result.cards);
  };

  it('finds an order that fits every card, numbers before Wilds', () => {
    expect(grown(nums(9, 10, 11, 12), 'run', [wild(), num(7)])).toEqual([7, 'W', 9, 10, 11, 12]);
    expect(grown(nums(3, 4, 5, 6), 'run', [num(8), wild()])).toEqual([3, 4, 5, 6, 'W', 8]);
    expect(grown(nums(8, 9, 10, 11), 'run', [num(12), wild()])).toEqual(['W', 8, 9, 10, 11, 12]);
  });

  it('refuses when any card can never fit, leaving the group unchanged', () => {
    const run = group('run', nums(3, 4, 5, 6));

    expect(orderHits(run, [wild(), num(1)])).toBeNull();
    expect(grown(nums(7, 7, 7), 'set', [wild(), num(7), num(8)])).toBeNull();
    expect(grown([num(2, 'green')], 'color', [wild(), num(5, 'green'), num(5, 'blue')])).toBeNull();
    expect(values(run.cards)).toEqual([3, 4, 5, 6]);
  });
});

describe('Wild hits near 12', () => {
  it('lets a run ending at 12 take a Wild at the bottom', () => {
    const full = group('run', nums(9, 10, 11, 12));
    const withWild = group('run', [wild(), ...nums(10, 11, 12)]);

    expect(canHit(full, wild())).toBe(true);
    expect(canHit(withWild, wild())).toBe(true);
    expect(values(applyHit(withWild, wild()).cards)).toEqual(['W', 'W', 10, 11, 12]);
  });
});
