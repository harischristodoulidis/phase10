import { describe, expect, it } from 'vite-plus/test';

import { getPhase } from './phases';
import type { Card, CardColor, CardValue, PhaseNumber } from './types';
import { validatePhase } from './validatePhase';

let nextId = 0;

function num(value: CardValue, color: CardColor = 'red'): Card {
  nextId++;
  return { kind: 'number', id: `n${nextId}`, value, color };
}

function nums(...values: CardValue[]): Card[] {
  return values.map((value) => num(value));
}

function wild(): Card {
  nextId++;
  return { kind: 'wild', id: `w${nextId}` };
}

function skip(): Card {
  nextId++;
  return { kind: 'skip', id: `s${nextId}` };
}

function check(phase: PhaseNumber, cards: readonly Card[]): ReturnType<typeof validatePhase> {
  return validatePhase(cards, getPhase(phase));
}

function values(cards: readonly Card[]): (number | 'W')[] {
  return cards.map((card) => (card.kind === 'number' ? card.value : 'W'));
}

const reds = (...vs: CardValue[]): Card[] => vs.map((v) => num(v, 'red'));

const VALID: readonly [PhaseNumber, () => Card[]][] = [
  [1, () => nums(3, 3, 3, 9, 9, 9)],
  [2, () => nums(5, 5, 5, 7, 8, 9, 10)],
  [3, () => nums(2, 2, 2, 2, 9, 10, 11, 12)],
  [4, () => [num(1), num(2, 'blue'), num(3, 'green'), num(4), num(5), num(6), num(7, 'yellow')]],
  [5, () => nums(3, 4, 5, 6, 7, 8, 9, 10)],
  [6, () => nums(2, 3, 4, 5, 6, 7, 8, 9, 10)],
  [7, () => nums(4, 4, 4, 4, 11, 11, 11, 11)],
  [8, () => reds(1, 1, 4, 7, 9, 11, 12)],
  [9, () => nums(6, 6, 6, 6, 6, 1, 1)],
  [10, () => nums(8, 8, 8, 8, 12, 12, 12)],
];

const NEAR_MISS: readonly [PhaseNumber, () => Card[]][] = [
  [1, () => nums(8, 8, 9, 4, 4, 4)],
  [2, () => nums(5, 5, 5, 7, 8, 9, 11)],
  [3, () => nums(2, 2, 2, 3, 9, 10, 11, 12)],
  [4, () => nums(1, 2, 3, 4, 5, 6, 8)],
  [5, () => nums(3, 4, 5, 6, 7, 8, 9, 11)],
  [6, () => nums(2, 3, 4, 5, 6, 7, 8, 9, 11)],
  [7, () => nums(4, 4, 4, 4, 11, 11, 11, 10)],
  [8, () => [...reds(1, 1, 4, 7, 9, 11), num(12, 'blue')]],
  [9, () => nums(3, 3, 3, 3, 4, 8, 8)],
  [10, () => nums(8, 8, 8, 9, 12, 12, 12)],
];

describe('validatePhase', () => {
  it.each(VALID)('accepts a valid phase %i', (phase, cards) => {
    expect(check(phase, cards()).ok).toBe(true);
  });

  it.each(NEAR_MISS)('rejects a near miss for phase %i', (phase, cards) => {
    expect(check(phase, cards())).toEqual({
      ok: false,
      reason: `Not quite — these cards don't make ${getPhase(phase).label}.`,
    });
  });

  it('rejects the wrong number of cards', () => {
    const reason = 'Phase 1 needs exactly 6 cards.';

    expect(check(1, nums(3, 3, 3, 9, 9))).toEqual({ ok: false, reason });
    expect(check(1, nums(3, 3, 3, 9, 9, 9, 9))).toEqual({ ok: false, reason });
  });

  it('rejects a Skip even when the other cards would work', () => {
    expect(check(1, [...nums(3, 3, 3, 9, 9), skip()])).toEqual({
      ok: false,
      reason: "A Skip can't be used in a phase.",
    });
  });

  it('rejects a group made only of Wilds', () => {
    expect(check(4, Array.from({ length: 7 }, wild)).ok).toBe(false);
    expect(check(8, Array.from({ length: 7 }, wild)).ok).toBe(false);
  });

  it('accepts runs at the 1 and 12 edges', () => {
    expect(check(4, nums(1, 2, 3, 4, 5, 6, 7)).ok).toBe(true);
    expect(check(4, nums(6, 7, 8, 9, 10, 11, 12)).ok).toBe(true);
  });

  it('rejects a run that wraps from 12 to 1', () => {
    expect(check(4, nums(10, 11, 12, 1, 2, 3, 4)).ok).toBe(false);
  });

  it('accepts a color group with a Wild', () => {
    expect(check(8, [...reds(2, 3, 5, 8, 10, 12), wild()]).ok).toBe(true);
  });

  it('puts the Wild in the run when the set is already full', () => {
    const result = check(2, [...nums(5, 5, 5, 7, 8, 9), wild()]);

    expect(result.ok && result.value.map((group) => values(group.cards))).toEqual([
      [5, 5, 5],
      [7, 8, 9, 'W'],
    ]);
  });

  it('puts the Wild in the set when the run is already full', () => {
    const result = check(2, [...nums(5, 5, 7, 8, 9, 10), wild()]);

    expect(result.ok && result.value.map((group) => values(group.cards))).toEqual([
      [5, 5, 'W'],
      [7, 8, 9, 10],
    ]);
  });

  it('fills several gaps in a run with Wilds', () => {
    const result = check(6, [num(2), wild(), num(4), wild(), ...nums(6, 7, 8, 9, 10)]);

    expect(result.ok && values(result.value[0].cards)).toEqual([2, 'W', 4, 'W', 6, 7, 8, 9, 10]);
  });

  it('extends a run upward with an extra Wild', () => {
    const result = check(4, [...nums(3, 4, 5, 6, 7, 8), wild()]);

    expect(result.ok && values(result.value[0].cards)).toEqual([3, 4, 5, 6, 7, 8, 'W']);
  });

  it('extends a run downward when it would pass 12', () => {
    const result = check(4, [...nums(7, 8, 9, 10, 11, 12), wild()]);

    expect(result.ok && values(result.value[0].cards)).toEqual(['W', 7, 8, 9, 10, 11, 12]);
  });

  it('extends upward as far as 12, then downward', () => {
    const result = check(4, [...nums(7, 8, 9, 10, 11), wild(), wild()]);

    expect(result.ok && values(result.value[0].cards)).toEqual(['W', 7, 8, 9, 10, 11, 'W']);
  });

  it('returns every card exactly once, with groups in requirement order', () => {
    const cards = [...nums(9, 9, 2, 2), wild(), wild()];
    const result = check(1, cards);

    expect(result.ok && result.value.map((group) => group.type)).toEqual(['set', 'set']);
    expect(
      result.ok && result.value.flatMap((group) => group.cards.map((card) => card.id)).sort()
    ).toEqual(cards.map((card) => card.id).sort());
  });

  it('does not mutate the input', () => {
    const cards = [...nums(7, 8, 9, 10, 11), wild(), wild()];
    const before = [...cards];
    check(4, cards);

    expect(cards).toEqual(before);
  });
});

describe('validatePhase edge cases', () => {
  it('rejects a two-group phase with only one number card', () => {
    expect(check(1, [num(3), ...Array.from({ length: 5 }, wild)]).ok).toBe(false);
    expect(check(9, [num(6), ...Array.from({ length: 6 }, wild)]).ok).toBe(false);
  });

  it('accepts a phase 9 where Wilds fill out the set of 5', () => {
    expect(check(9, [...nums(6, 6, 6, 6, 6), wild(), wild()]).ok).toBe(true);
  });

  it('accepts Wilds split across two sets', () => {
    expect(check(1, [...nums(3, 3, 3), wild(), wild(), wild()]).ok).toBe(true);
  });

  it('accepts a Wild in the set of 2 for phase 9', () => {
    const result = check(9, [...nums(6, 6, 6, 6, 6, 1), wild()]);

    expect(result.ok && result.value.map((group) => values(group.cards))).toEqual([
      [6, 6, 6, 6, 6],
      [1, 'W'],
    ]);
  });

  it('rejects a duplicate value in a run even with Wilds to spare', () => {
    expect(check(4, [...nums(3, 3, 4, 5), wild(), wild(), wild()]).ok).toBe(false);
  });

  it('can use the same number in both the set and the run', () => {
    const result = check(3, nums(2, 2, 2, 2, 2, 3, 4, 5));

    expect(result.ok && result.value.map((group) => values(group.cards))).toEqual([
      [2, 2, 2, 2],
      [2, 3, 4, 5],
    ]);
  });

  it('follows the RULES.md examples for a Wild at either end of a run', () => {
    const up = check(2, [...nums(9, 9, 9, 3, 4, 5), wild()]);
    const down = check(2, [...nums(1, 1, 1, 10, 11, 12), wild()]);

    expect(up.ok && values(up.value[1].cards)).toEqual([3, 4, 5, 'W']);
    expect(down.ok && values(down.value[1].cards)).toEqual(['W', 10, 11, 12]);
  });

  it('extends a run from 1 upward with Wilds', () => {
    const result = check(4, [...nums(1, 2, 3, 4, 5), wild(), wild()]);

    expect(result.ok && values(result.value[0].cards)).toEqual([1, 2, 3, 4, 5, 'W', 'W']);
  });

  it('rejects a color group with one wrong color even with a Wild', () => {
    expect(check(8, [...reds(1, 4, 7, 9, 11), num(2, 'blue'), wild()]).ok).toBe(false);
  });
});
