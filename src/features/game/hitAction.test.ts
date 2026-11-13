import { describe, expect, it, vi } from 'vite-plus/test';

import type { Group } from '@features/game-engine';

import { hitAction, phaseSlots } from './hitAction';
import { makeGame, num, skip } from './test/makeGame';

const setOfFours = (): Group => ({ id: 'g1', type: 'set', cards: [num(4), num(4), num(4)] });

describe('phaseSlots', () => {
  it('shows the phase requirement until the phase is laid down', () => {
    const [player] = makeGame([]).players;

    expect(phaseSlots(player).map((slot) => slot.label)).toEqual(['Set of 3', 'Set of 3']);
  });

  it('shows the laid groups afterwards', () => {
    const [player] = makeGame([]).players;
    const run: Group = { id: 'g1', type: 'run', cards: [num(1), num(2), num(3), num(4)] };
    const laid = { ...player, hasLaidDown: true, laidGroups: [run] };

    expect(phaseSlots(laid).map((slot) => slot.label)).toEqual(['Run of 4']);
  });
});

describe('hitAction', () => {
  it('offers a hit when the card fits the group', () => {
    const onHit = vi.fn();
    const hit = hitAction(num(4, 'blue'), setOfFours(), 'Ben', onHit);

    expect(hit?.label).toBe('blue 4 to Ben’s set of 3');
    hit?.onHit();
    expect(onHit).toHaveBeenCalledWith('g1');
  });

  it('offers nothing for a card that doesn’t fit, a Skip, or an empty slot', () => {
    expect(hitAction(num(5), setOfFours(), null, vi.fn())).toBeNull();
    expect(hitAction(skip(), setOfFours(), null, vi.fn())).toBeNull();
    expect(hitAction(num(4), null, null, vi.fn())).toBeNull();
    expect(hitAction(undefined, setOfFours(), null, vi.fn())).toBeNull();
  });
});
