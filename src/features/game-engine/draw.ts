import { createRng, nextSeed } from '@lib/rng';

import { shuffle } from './deck';
import { fail, stepError, updateCurrent } from './turnState';
import type { Card, GameState, Result } from './types';

export type DrawSource = 'deck' | 'discard';

type Piles = Pick<GameState, 'drawPile' | 'discardPile' | 'rngSeed'>;

export function canDraw(state: GameState): boolean {
  const top = state.discardPile.at(-1);
  return (
    state.drawPile.length > 0 ||
    state.discardPile.length > 1 ||
    (top !== undefined && top.kind !== 'skip')
  );
}

// With nothing to draw from either pile, the player skips the draw step.
export function draw(state: GameState, source: DrawSource): Result<GameState> {
  const error = stepError(state, 'draw');
  if (error !== null) {
    return fail(error);
  }
  if (!canDraw(state)) {
    return { ok: true, value: { ...state, turnStep: 'play' } };
  }
  const result = source === 'deck' ? drawFromDeck(state) : drawFromDiscard(state);
  if (!result.ok) {
    return result;
  }
  const { card, ...piles } = result.value;
  const players = updateCurrent(state, (player) => ({ ...player, hand: [...player.hand, card] }));
  return { ok: true, value: { ...state, ...piles, players, turnStep: 'play' } };
}

function drawFromDiscard(state: GameState): Result<Piles & { card: Card }> {
  const card = state.discardPile.at(-1);
  if (card === undefined) {
    return fail('The discard pile is empty.');
  }
  if (card.kind === 'skip') {
    return fail("A Skip can't be picked up.");
  }
  const discardPile = state.discardPile.slice(0, -1);
  return {
    ok: true,
    value: { card, drawPile: state.drawPile, discardPile, rngSeed: state.rngSeed },
  };
}

function drawFromDeck(state: GameState): Result<Piles & { card: Card }> {
  const piles = state.drawPile.length > 0 ? state : reshuffle(state);
  const card = piles.drawPile.at(-1);
  if (card === undefined) {
    return fail('The draw pile is empty. Take the top discard instead.');
  }
  const drawPile = piles.drawPile.slice(0, -1);
  return {
    ok: true,
    value: { card, drawPile, discardPile: piles.discardPile, rngSeed: piles.rngSeed },
  };
}

function reshuffle(state: GameState): Piles {
  const top = state.discardPile.at(-1);
  if (top === undefined) {
    return state;
  }
  const rng = createRng(state.rngSeed);
  const drawPile = shuffle(state.discardPile.slice(0, -1), rng);
  return { drawPile, discardPile: [top], rngSeed: nextSeed(rng) };
}
