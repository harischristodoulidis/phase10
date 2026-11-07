import type { PlayerCount } from '@features/game-engine';

export type SetupState = {
  playerCount: PlayerCount;
  names: string[];
};
