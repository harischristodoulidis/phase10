import { describe, expect, it } from 'vite-plus/test';

import type { RootState } from '@app/store';

import { selectActiveNames, selectCanStart, selectPlayerCount } from './selectors';

function stateWith(playerCount: RootState['setup']['playerCount'], names: string[]): RootState {
  return { setup: { playerCount, names }, game: null };
}

describe('setup selectors', () => {
  it('selectPlayerCount returns the count', () => {
    expect(selectPlayerCount(stateWith(3, ['', '', '', '', '', '']))).toBe(3);
  });

  it('selectActiveNames returns only the seats in play', () => {
    const state = stateWith(3, ['A', 'B', 'C', 'D', 'E', 'F']);

    expect(selectActiveNames(state)).toEqual(['A', 'B', 'C']);
  });

  it('selectCanStart is false when an active name is blank or whitespace', () => {
    expect(selectCanStart(stateWith(2, ['A', '', '', '', '', '']))).toBe(false);
    expect(selectCanStart(stateWith(2, ['A', '   ', '', '', '', '']))).toBe(false);
  });

  it('selectCanStart ignores seats outside the player count', () => {
    expect(selectCanStart(stateWith(2, ['A', 'B', '', '', '', '']))).toBe(true);
  });
});
