import {
  currentPlayer,
  handPoints,
  leftOf,
  type GameState,
  type Player,
} from '@features/game-engine';

import { assertNever } from '@lib/assertNever';

import { ROUND_COPY } from './constants';

export type RoundOutcome =
  | { kind: 'advanced'; from: number; to: number }
  | { kind: 'repeats'; phase: number }
  | { kind: 'tied' }
  | { kind: 'sitsOut' };

export type RoundResult = {
  player: Player;
  wentOut: boolean;
  points: number;
  outcome: RoundOutcome;
};

export type RoundSummary = {
  wentOut: Player;
  results: RoundResult[];
  nextDealer: Player;
  tiedPlayers: Player[];
};

function outcomeOf(player: Player, isTiebreak: boolean): RoundOutcome {
  if (isTiebreak) {
    return { kind: player.isSittingOut ? 'sitsOut' : 'tied' };
  }
  if (!player.hasLaidDown) {
    return { kind: 'repeats', phase: player.phase };
  }
  return { kind: 'advanced', from: player.phase - 1, to: player.phase };
}

export function outcomeText(outcome: RoundOutcome): string {
  switch (outcome.kind) {
    case 'advanced':
      return ROUND_COPY.advanced(outcome.from, outcome.to);
    case 'repeats':
      return ROUND_COPY.repeats(outcome.phase);
    case 'tied':
      return ROUND_COPY.tied;
    case 'sitsOut':
      return ROUND_COPY.sitsOut;
    default:
      return assertNever(outcome);
  }
}

// Reads the round back from state: endRound keeps hands and hasLaidDown until the next deal.
export function summarizeRound(game: GameState): RoundSummary {
  const wentOut = currentPlayer(game);
  return {
    wentOut,
    results: game.players.map((player) => ({
      player,
      wentOut: player.id === wentOut.id,
      points: handPoints(player.hand),
      outcome: outcomeOf(player, game.isTiebreak),
    })),
    nextDealer: game.players[leftOf(game.dealerIndex, game.players.length)],
    tiedPlayers: game.isTiebreak ? game.players.filter((player) => !player.isSittingOut) : [],
  };
}
