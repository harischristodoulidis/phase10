import { assertNever } from '@lib/assertNever';

import { leftOf } from './deck';
import { orderHits } from './hit';
import { getPhase } from './phases';
import { endRound } from './round';
import { applySkip } from './skip';
import { currentPlayer, fail, stepError, updateCurrent } from './turnState';
import type { Card, GameState, Result } from './types';
import { validateSlots } from './validatePhase';

export function describeCard(card: Card): string {
  switch (card.kind) {
    case 'number':
      return `a ${card.color} ${card.value}`;
    case 'wild':
      return 'a Wild';
    case 'skip':
      return 'a Skip';
    default:
      return assertNever(card);
  }
}

export function revealHand(state: GameState): Result<GameState> {
  if (state.view === 'turn') {
    return fail('The cards are already showing.');
  }
  if (state.view !== 'handoff') {
    return fail('The round is over.');
  }
  return { ok: true, value: { ...state, view: 'turn' } };
}

function takeCards(
  hand: readonly Card[],
  cardIds: readonly string[]
): Result<{ cards: Card[]; rest: Card[] }> {
  if (new Set(cardIds).size !== cardIds.length) {
    return fail('Pick each card only once.');
  }
  const cards = hand.filter((card) => cardIds.includes(card.id));
  if (cards.length !== cardIds.length) {
    return fail("That card isn't in your hand.");
  }
  return { ok: true, value: { cards, rest: hand.filter((card) => !cardIds.includes(card.id)) } };
}

export function layDown(
  state: GameState,
  slots: readonly (readonly string[])[]
): Result<GameState> {
  const error = stepError(state, 'play');
  if (error !== null) {
    return fail(error);
  }
  const player = currentPlayer(state);
  if (player.hasLaidDown) {
    return fail("You've already laid down your phase this round.");
  }
  const picked = takeCards(player.hand, slots.flat());
  if (!picked.ok) {
    return picked;
  }
  const byId = new Map(picked.value.cards.map((card) => [card.id, card]));
  const slotCards = slots.map((ids) => ids.flatMap((id) => byId.get(id) ?? []));
  const phase = validateSlots(slotCards, getPhase(player.phase));
  if (!phase.ok) {
    return phase;
  }
  const laidGroups = phase.value.map((group, i) => ({ ...group, id: `${player.id}-g${i + 1}` }));
  const players = updateCurrent(state, (current) => ({
    ...current,
    hand: picked.value.rest,
    laidGroups,
    hasLaidDown: true,
  }));
  return { ok: true, value: { ...state, players } };
}

// Adds all the cards to one group, or none of them if any card doesn't fit.
export function hit(
  state: GameState,
  cardIds: readonly string[],
  groupId: string
): Result<GameState> {
  const error = stepError(state, 'play');
  if (error !== null) {
    return fail(error);
  }
  const player = currentPlayer(state);
  if (!player.hasLaidDown) {
    return fail('Lay down your phase before hitting.');
  }
  if (cardIds.length === 0) {
    return fail('Pick a card to add.');
  }
  const picked = takeCards(player.hand, cardIds);
  if (!picked.ok) {
    return picked;
  }
  if (picked.value.cards.some((card) => card.kind === 'skip')) {
    return fail("A Skip can't be used as a hit.");
  }
  const group = state.players.flatMap((p) => p.laidGroups).find((g) => g.id === groupId);
  if (group === undefined) {
    return fail("That group isn't on the table.");
  }
  const grown = orderHits(group, picked.value.cards);
  if (grown === null) {
    return fail(
      cardIds.length === 1
        ? "That card doesn't fit this group."
        : "These cards don't all fit this group."
    );
  }
  const players = state.players.map((p, i) => ({
    ...p,
    hand: i === state.currentPlayerIndex ? picked.value.rest : p.hand,
    laidGroups: p.laidGroups.map((g) => (g.id === groupId ? grown : g)),
  }));
  const next = { ...state, players };
  return { ok: true, value: picked.value.rest.length === 0 ? endRound(next) : next };
}

export function discard(
  state: GameState,
  cardId: string,
  skipTargetId?: string
): Result<GameState> {
  const error = stepError(state, 'play');
  if (error !== null) {
    return fail(error);
  }
  const player = currentPlayer(state);
  const card = player.hand.find((c) => c.id === cardId);
  if (card === undefined) {
    return fail("That card isn't in your hand.");
  }
  let players = updateCurrent(state, (p) => ({
    ...p,
    hand: p.hand.filter((c) => c.id !== cardId),
  }));
  let lastAction = `${player.name} discarded ${describeCard(card)}`;
  if (card.kind === 'skip') {
    const skipped = applySkip(state, players, skipTargetId);
    if (!skipped.ok) {
      return skipped;
    }
    players = skipped.value.players;
    if (skipped.value.target !== null) {
      lastAction = `${player.name} skipped ${skipped.value.target.name}`;
    }
  }
  const next = { ...state, players, discardPile: [...state.discardPile, card], lastAction };
  return { ok: true, value: player.hand.length === 1 ? endRound(next) : advance(next) };
}

function advance(state: GameState): GameState {
  let players = state.players;
  let index = leftOf(state.currentPlayerIndex, players.length);
  const messages = state.lastAction === null ? [] : [state.lastAction];
  while (players[index].isSittingOut || players[index].isSkipped) {
    if (players[index].isSkipped) {
      const skippedIndex = index;
      messages.push(`${players[index].name}'s turn was skipped`);
      players = players.map((p, i) => (i === skippedIndex ? { ...p, isSkipped: false } : p));
    }
    index = leftOf(index, players.length);
  }
  return {
    ...state,
    players,
    currentPlayerIndex: index,
    turnStep: 'draw',
    view: 'handoff',
    lastAction: messages.join(' · '),
  };
}
