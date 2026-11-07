import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PlayerCount } from '@features/game-engine';

import { DEFAULT_PLAYER_COUNT, MAX_PLAYERS } from './constants';
import type { SetupState } from './types';

const initialState: SetupState = {
  playerCount: DEFAULT_PLAYER_COUNT,
  names: Array.from({ length: MAX_PLAYERS }, () => ''),
};

export const setupSlice = createSlice({
  name: 'setup',
  initialState,
  reducers: {
    playerCountChanged(state, action: PayloadAction<PlayerCount>) {
      state.playerCount = action.payload;
    },
    playerNameChanged(state, action: PayloadAction<{ seat: number; name: string }>) {
      const { seat, name } = action.payload;
      if (Number.isInteger(seat) && seat >= 0 && seat < MAX_PLAYERS) {
        state.names[seat] = name;
      }
    },
    setupReset() {
      return initialState;
    },
  },
});

export const { playerCountChanged, playerNameChanged, setupReset } = setupSlice.actions;
export const setupReducer = setupSlice.reducer;
