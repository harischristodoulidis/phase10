import { describe, expect, it } from 'vite-plus/test';

import { getPhase, type Group } from '@features/game-engine';

import { groupDetail, groupLabel, hitLabel, slotEntries } from './hitAction';
import { num, wild } from './test/makeGame';

const setOfFours = (): Group => ({ id: 'g1', type: 'set', cards: [num(4), num(4), num(4)] });

describe('groupLabel and hitLabel', () => {
  it('name a group by its type and current size', () => {
    expect(groupLabel(setOfFours())).toBe('Set of 3');
  });

  it('say whose group a card is added to, and which one', () => {
    expect(hitLabel([num(4, 'blue')], setOfFours(), 'Ben')).toBe(
      'Add blue 4 to Ben’s set of 3 (4s)'
    );
    expect(hitLabel([num(4, 'blue')], setOfFours(), null)).toBe('Add blue 4 to your set of 3 (4s)');
  });
});

describe('groupDetail', () => {
  it('describes a set by its number, a run by its range and a color group by its color', () => {
    const run: Group = { id: 'g2', type: 'run', cards: [wild(), num(3), num(4), num(5)] };
    const greens: Group = { id: 'g3', type: 'color', cards: [num(2, 'green'), num(9, 'green')] };

    expect(groupDetail(setOfFours())).toBe('4s');
    expect(groupDetail(run)).toBe('2 to 5');
    expect(groupDetail(greens)).toBe('green');
  });
});

describe('slotEntries', () => {
  it('gives each phase slot a stable id in phase order', () => {
    expect(slotEntries(getPhase(2).groups)).toEqual([
      { id: 'slot-1', slot: 0, requirement: { type: 'set', size: 3 } },
      { id: 'slot-2', slot: 1, requirement: { type: 'run', size: 4 } },
    ]);
  });
});
