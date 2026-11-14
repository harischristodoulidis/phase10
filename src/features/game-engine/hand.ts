import { currentPlayer, fail, updateCurrent } from './turnState';
import type { GameState, Result } from './types';

export function arrangeHand(state: GameState, cardIds: readonly string[]): Result<GameState> {
  if (state.view === 'handoff') {
    return fail('Show your cards first.');
  }
  if (state.view !== 'turn' || state.turnStep === 'done') {
    return fail('The round is over.');
  }
  const { hand } = currentPlayer(state);
  const byId = new Map(hand.map((card) => [card.id, card]));
  const arranged = cardIds.flatMap((id) => byId.get(id) ?? []);
  const isWholeHand = cardIds.length === hand.length && arranged.length === hand.length;
  if (!isWholeHand || new Set(cardIds).size !== cardIds.length) {
    return fail('Arrange every card in your hand exactly once.');
  }
  const players = updateCurrent(state, (player) => ({ ...player, hand: arranged }));
  return { ok: true, value: { ...state, players } };
}
