import type { PlayerCount } from '@features/game-engine';

import { MAX_PLAYERS, PLAYER_COUNTS } from './constants';
import type { SetupState } from './types';

function isPlayerCount(value: unknown): value is PlayerCount {
  return PLAYER_COUNTS.some((count) => count === value);
}

export function isSetupState(value: unknown): value is SetupState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('playerCount' in value) || !('names' in value)) {
    return false;
  }
  const { playerCount, names } = value;
  return (
    isPlayerCount(playerCount) &&
    Array.isArray(names) &&
    names.length === MAX_PLAYERS &&
    names.every((name) => typeof name === 'string')
  );
}
