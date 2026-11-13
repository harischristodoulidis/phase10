import { nextActive, type GameState, type Player } from '@features/game-engine';

export function dealerOf(game: GameState): Player {
  return game.players[game.dealerIndex];
}

export function opponentsOf(game: GameState): Player[] {
  return game.players.filter((p, i) => i !== game.currentPlayerIndex && !p.isSittingOut);
}

// Follows the engine's turn order: sitting-out and skipped players are passed over,
// including the target of a Skip the current player has chosen but not yet played.
export function nextPlayerId(game: GameState, pendingSkipId: string | null = null): string {
  const start = game.currentPlayerIndex;
  const isSkipped = (index: number) =>
    game.players[index].isSkipped || game.players[index].id === pendingSkipId;
  let index = nextActive(game.players, start);
  while (isSkipped(index) && index !== start) {
    index = nextActive(game.players, index);
  }
  return game.players[index].id;
}
