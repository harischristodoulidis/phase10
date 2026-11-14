import { describe, expect, it } from 'vite-plus/test';

import { getPhase, PHASES, phaseCardCount } from './phases';
import type { GroupType } from './types';

const EXPECTED: readonly (readonly [GroupType, number][])[] = [
  [
    ['set', 3],
    ['set', 3],
  ],
  [
    ['set', 3],
    ['run', 4],
  ],
  [
    ['set', 4],
    ['run', 4],
  ],
  [['run', 7]],
  [['run', 8]],
  [['run', 9]],
  [
    ['set', 4],
    ['set', 4],
  ],
  [['color', 7]],
  [
    ['set', 5],
    ['set', 2],
  ],
  [
    ['set', 4],
    ['set', 3],
  ],
];

describe('PHASES', () => {
  it('has phases 1 to 10 in order', () => {
    expect(PHASES.map((requirement) => requirement.phase)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('matches the RULES.md table', () => {
    expect(
      PHASES.map((requirement) => requirement.groups.map((group) => [group.type, group.size]))
    ).toEqual(EXPECTED);
  });

  it('needs the right number of cards for each phase', () => {
    expect(PHASES.map(phaseCardCount)).toEqual([6, 7, 8, 7, 8, 9, 8, 7, 7, 7]);
  });
});

describe('getPhase', () => {
  it('returns the requirement for a phase number', () => {
    expect(getPhase(1).label).toBe('2 sets of 3');
    expect(getPhase(8).label).toBe('7 cards of one color');
    expect(getPhase(10).phase).toBe(10);
  });
});
