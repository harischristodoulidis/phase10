import { afterEach, describe, expect, it } from 'vite-plus/test';

import { gameStarted } from '@features/game';
import { playerCountChanged } from '@features/setup';

import { loadPersistedState, makeStore, STORAGE_KEY } from './store';

const validSetup = { playerCount: 3, names: ['A', 'B', 'C', '', '', ''] };

afterEach(() => localStorage.clear());

describe('store persistence', () => {
  it('loads a valid saved setup', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ setup: validSetup }));

    expect(loadPersistedState()).toEqual({ setup: validSetup });
  });

  it('discards an invalid saved setup', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ setup: { playerCount: 9, names: [] } }));

    expect(loadPersistedState()).toEqual({});
  });

  it('discards saved data that is not an object', () => {
    localStorage.setItem(STORAGE_KEY, '42');

    expect(loadPersistedState()).toEqual({});
  });

  it('saves setup and game to localStorage after an action', () => {
    const store = makeStore();
    store.dispatch(playerCountChanged(5));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({
      setup: store.getState().setup,
      game: null,
    });
  });

  it('loads a saved game and drops an invalid one', () => {
    const store = makeStore();
    store.dispatch(gameStarted(['A', 'B']));
    const { game } = store.getState();

    expect(loadPersistedState()).toEqual({ setup: store.getState().setup, game });

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: { players: [] } }));
    expect(loadPersistedState()).toEqual({});
  });

  it('loads a game saved before the tiebreak flag existed', () => {
    const store = makeStore();
    store.dispatch(gameStarted(['A', 'B']));
    const { game } = store.getState();
    if (game === null) {
      throw new Error('No game started.');
    }
    const { isTiebreak: _, ...oldGame } = game;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: oldGame }));

    expect(loadPersistedState().game).toEqual({ ...oldGame, isTiebreak: false });
  });
});
