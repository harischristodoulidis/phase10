import { currentPlayer, fail } from './turnState';
import type { GameState, Player, Result } from './types';

export function skipTargets(state: GameState): Player[] {
  return state.players.filter(
    (player, i) =>
      i !== state.currentPlayerIndex && !player.wasSkippedThisRound && !player.isSittingOut
  );
}

// With no one left to skip, the Skip has no effect and the target is null.
export function applySkip(
  state: GameState,
  players: readonly Player[],
  skipTargetId: string | undefined
): Result<{ players: Player[]; target: Player | null }> {
  const targets = skipTargets(state);
  if (targets.length === 0) {
    return { ok: true, value: { players: [...players], target: null } };
  }
  const target = state.players.find((p) => p.id === skipTargetId);
  if (target === undefined) {
    return fail('Choose a player to skip.');
  }
  if (target.id === currentPlayer(state).id) {
    return fail("You can't skip yourself.");
  }
  if (target.isSittingOut) {
    return fail(`${target.name} isn't playing this round.`);
  }
  if (!targets.some((p) => p.id === target.id)) {
    return fail(`${target.name} has already been skipped this round.`);
  }
  const skipped = players.map((p) =>
    p.id === target.id ? { ...p, isSkipped: true, wasSkippedThisRound: true } : p
  );
  return { ok: true, value: { players: skipped, target } };
}
