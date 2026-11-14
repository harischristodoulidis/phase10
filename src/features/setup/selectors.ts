import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';
import type { PlayerCount } from '@features/game-engine';

export const selectPlayerCount = (state: RootState): PlayerCount => state.setup.playerCount;

const selectNames = (state: RootState) => state.setup.names;

export const selectActiveNames = createSelector([selectNames, selectPlayerCount], (names, count) =>
  names.slice(0, count)
);

export const selectCanStart = (state: RootState): boolean =>
  selectActiveNames(state).every((name) => name.trim() !== '');
