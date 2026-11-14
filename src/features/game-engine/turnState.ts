import { leftOf } from './deck';
import type { GameState, Player, TurnStep } from './types';

export function fail(reason: string): { ok: false; reason: string } {
  return { ok: false, reason };
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function updateCurrent(state: GameState, update: (player: Player) => Player): Player[] {
  return state.players.map((player, i) =>
    i === state.currentPlayerIndex ? update(player) : player
  );
}

export function stepError(state: GameState, expected: TurnStep): string | null {
  if (state.view === 'handoff') {
    return 'Show your cards first.';
  }
  if (state.view !== 'turn' || state.turnStep === 'done') {
    return 'The round is over.';
  }
  if (state.turnStep === expected) {
    return null;
  }
  return expected === 'draw' ? "You've already drawn a card this turn." : 'Draw a card first.';
}

export function nextActive(players: readonly Player[], index: number): number {
  let next = leftOf(index, players.length);
  while (players[next].isSittingOut) {
    next = leftOf(next, players.length);
  }
  return next;
}
