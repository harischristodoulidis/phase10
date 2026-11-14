import { describe, expect, it } from 'vite-plus/test';

import { getPhase } from './phases';
import { num, nums, skip, wild } from './testUtils';
import { fillSlots, validateSlots } from './validatePhase';

const NEEDS_3 = 'This slot needs exactly 3 cards — select them all, then drop them together.';

describe('fillSlots', () => {
  const phase1 = getPhase(1);

  it('takes cards that complete the slot they are dropped on', () => {
    expect(fillSlots([[], []], [...nums(4, 4), wild()], 1, phase1)).toEqual({
      ok: true,
      value: { kind: 'slot' },
    });
    expect(fillSlots([nums(4, 4), []], [wild()], 0, phase1)).toEqual({
      ok: true,
      value: { kind: 'slot' },
    });
  });

  it('refuses too few or too many cards for the slot', () => {
    expect(fillSlots([[], []], [num(4)], 0, phase1)).toEqual({ ok: false, reason: NEEDS_3 });
    expect(fillSlots([[], []], nums(4, 4), 0, phase1)).toEqual({ ok: false, reason: NEEDS_3 });
    expect(fillSlots([[], []], nums(4, 4, 4, 4), 0, phase1)).toEqual({
      ok: false,
      reason: NEEDS_3,
    });
  });

  it('says how many more cards a part-filled slot needs', () => {
    expect(fillSlots([[num(4)], []], [num(4)], 0, phase1)).toEqual({
      ok: false,
      reason: 'This slot needs exactly 2 more cards.',
    });
    expect(fillSlots([nums(4, 4), []], [num(9)], 0, phase1)).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make a set of 3.",
    });
    expect(fillSlots([[], []], nums(4, 4, 4), 2, phase1)).toEqual({
      ok: false,
      reason: 'That slot isn’t part of your phase.',
    });
    expect(fillSlots([[], []], [wild(), wild(), wild()], 0, phase1).ok).toBe(false);
  });

  it('gives the phase reason when a whole phase’s worth of cards does not make it', () => {
    expect(fillSlots([[], []], nums(4, 4, 4, 9, 9, 8), 0, phase1)).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make 2 sets of 3.",
    });
  });

  it('checks run edges and a Wild at the high end inside a slot', () => {
    const phase2 = getPhase(2);

    expect(fillSlots([[], []], nums(9, 10, 11, 12), 1, phase2).ok).toBe(true);
    expect(fillSlots([[], []], [...nums(1, 2, 3), wild()], 1, phase2).ok).toBe(true);
    expect(fillSlots([[], []], nums(10, 11, 12, 1), 1, phase2).ok).toBe(false);
  });

  it('refuses the right number of cards that do not make the group, and any Skip', () => {
    expect(fillSlots([[], []], nums(4, 4, 9), 0, phase1)).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make a set of 3.",
    });
    expect(fillSlots([[], []], [...nums(4, 4), skip()], 0, phase1)).toEqual({
      ok: false,
      reason: "A Skip can't be used in a phase.",
    });
    expect(fillSlots([[], []], nums(2, 3, 4, 5), 0, getPhase(2)).ok).toBe(false);
    expect(fillSlots([[], []], nums(2, 3, 4, 5), 1, getPhase(2)).ok).toBe(true);
  });

  it('splits a whole phase across the slots, counting cards already placed', () => {
    const fours = nums(4, 4, 4);
    const nines = [...nums(9, 9), wild()];
    const result = fillSlots([[], []], [nines[0], ...fours, nines[1], nines[2]], 0, phase1);
    const withPlaced = fillSlots([[fours[0]], []], [...fours.slice(1), ...nines], 0, phase1);

    expect(result.ok && result.value.kind).toBe('phase');
    expect(result.ok && result.value.kind === 'phase' && result.value.slots.flat()).toHaveLength(6);
    expect(withPlaced.ok && withPlaced.value.kind).toBe('phase');
  });

  it('fills the last open slot rather than regrouping', () => {
    expect(fillSlots([[], nums(9, 9, 9)], nums(4, 4, 4), 0, phase1)).toEqual({
      ok: true,
      value: { kind: 'slot' },
    });
  });

  it('may move placed cards to make a valid split', () => {
    const result = fillSlots(
      [[], nums(5)],
      [...nums(5, 5), wild(), ...nums(6, 7, 8)],
      0,
      getPhase(2)
    );
    const slots = result.ok && result.value.kind === 'phase' ? result.value.slots : [];

    expect(validateSlots(slots, getPhase(2)).ok).toBe(true);
  });
});

describe('validateSlots', () => {
  it('needs one slot per group', () => {
    expect(validateSlots([nums(4, 4, 4)], getPhase(1))).toEqual({
      ok: false,
      reason: 'Phase 1 needs 2 sets of 3.',
    });
  });

  it('accepts valid slots and keeps their order', () => {
    const result = validateSlots(
      [
        [...nums(5, 5), wild()],
        [num(7), wild(), ...nums(9, 10)],
      ],
      getPhase(2)
    );

    expect(result.ok && result.value.map((g) => g.type)).toEqual(['set', 'run']);
  });

  it('refuses a Skip or a slot of only Wilds', () => {
    expect(validateSlots([[...nums(3, 3), skip()], nums(9, 9, 9)], getPhase(1))).toEqual({
      ok: false,
      reason: "A Skip can't be used in a phase.",
    });
    expect(validateSlots([[wild(), wild(), wild()], nums(9, 9, 9)], getPhase(1)).ok).toBe(false);
  });

  it('names the group a slot fails to make', () => {
    expect(validateSlots([nums(4, 4, 4), nums(2, 3, 4, 6)], getPhase(2))).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make a run of 4.",
    });
  });
});
