import { currentPlayer, type GameState, type Player } from '@features/game-engine';

export type WinReason = 'onlyFinisher' | 'lowestTotal' | 'tiebreak';

export type Standing = {
  player: Player;
  isWinner: boolean;
  hasFinished: boolean;
};

export type GameResult = {
  winner: Player;
  reason: WinReason;
  standings: Standing[];
};

// Winner, then Phase 10 finishers by total, then everyone else by phase reached and total.
function byRank(a: Standing, b: Standing): number {
  return (
    Number(b.isWinner) - Number(a.isWinner) ||
    Number(b.hasFinished) - Number(a.hasFinished) ||
    (a.hasFinished ? 0 : b.player.phase - a.player.phase) ||
    a.player.score - b.player.score
  );
}

export function finalStandings(game: GameState): GameResult {
  const winner = game.players.find((player) => player.id === game.winnerId) ?? currentPlayer(game);
  const standings = game.players.map((player) => ({
    player,
    isWinner: player.id === winner.id,
    hasFinished: player.id === winner.id || game.finisherIds.includes(player.id),
  }));
  const otherFinishers = standings.filter((s) => s.hasFinished && !s.isWinner).length;
  return {
    winner,
    reason: game.isTiebreak ? 'tiebreak' : otherFinishers > 0 ? 'lowestTotal' : 'onlyFinisher',
    standings: standings.toSorted(byRank),
  };
}
