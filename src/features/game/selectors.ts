import type { RootState } from '@app/store';
import type { GameState } from '@features/game-engine';

export const selectGame = (state: RootState): GameState | null => state.game;
