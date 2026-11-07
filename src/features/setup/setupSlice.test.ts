import { describe, expect, it } from 'vite-plus/test';

import { playerCountChanged, playerNameChanged, setupReducer, setupReset } from './setupSlice';

const initial = setupReducer(undefined, { type: '@@init' });

describe('setupSlice', () => {
  it('starts with 4 players and 6 empty names', () => {
    expect(initial).toEqual({ playerCount: 4, names: ['', '', '', '', '', ''] });
  });

  it('playerCountChanged sets the count and keeps typed names', () => {
    const named = setupReducer(initial, playerNameChanged({ seat: 4, name: 'Eve' }));
    const fewer = setupReducer(named, playerCountChanged(2));
    const more = setupReducer(fewer, playerCountChanged(6));

    expect(fewer.playerCount).toBe(2);
    expect(more.names[4]).toBe('Eve');
  });

  it('playerNameChanged sets the name for one seat', () => {
    const state = setupReducer(initial, playerNameChanged({ seat: 1, name: 'Maria' }));

    expect(state.names).toEqual(['', 'Maria', '', '', '', '']);
  });

  it('playerNameChanged ignores seats out of range', () => {
    expect(setupReducer(initial, playerNameChanged({ seat: 6, name: 'X' }))).toEqual(initial);
    expect(setupReducer(initial, playerNameChanged({ seat: -1, name: 'X' }))).toEqual(initial);
  });

  it('setupReset restores the initial state', () => {
    const changed = setupReducer(
      setupReducer(initial, playerCountChanged(6)),
      playerNameChanged({ seat: 0, name: 'Haris' })
    );

    expect(setupReducer(changed, setupReset())).toEqual(initial);
  });
});
