import type { Rng } from '@lib/rng';

import type { COPIES_PER_NUMBER } from './constants';
import { CARD_COLORS, CARD_VALUES, HAND_SIZE, SKIP_COUNT, WILD_COUNT } from './constants';
import type { Card, PlayerCount } from './types';

export type DealResult = {
  hands: Card[][];
  drawPile: Card[];
  discardPile: Card[];
};

const COPY_SUFFIXES = ['a', 'b'] as const satisfies { length: typeof COPIES_PER_NUMBER };

export function createDeck(): Card[] {
  const numbers = CARD_COLORS.flatMap((color) =>
    CARD_VALUES.flatMap((value) =>
      COPY_SUFFIXES.map((suffix): Card => ({
        kind: 'number',
        id: `${color}-${value}-${suffix}`,
        value,
        color,
      }))
    )
  );
  const wilds = Array.from({ length: WILD_COUNT }, (_, i): Card => ({
    kind: 'wild',
    id: `wild-${i + 1}`,
  }));
  const skips = Array.from({ length: SKIP_COUNT }, (_, i): Card => ({
    kind: 'skip',
    id: `skip-${i + 1}`,
  }));
  return [...numbers, ...wilds, ...skips];
}

export function shuffle(cards: readonly Card[], rng: Rng): Card[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function dealerForFirstRound(count: PlayerCount): number {
  return count - 1;
}

export function leftOf(index: number, count: number): number {
  return (index + 1) % count;
}

// Expects an already shuffled deck. Dealing starts left of the dealer.
export function deal(deck: readonly Card[], count: number, dealerIndex: number): DealResult {
  const drawPile = [...deck];
  const hands: Card[][] = Array.from({ length: count }, () => []);
  let seat = leftOf(dealerIndex, count);
  for (let dealt = 0; dealt < HAND_SIZE * count; dealt++) {
    const card = drawPile.pop();
    if (card === undefined) {
      throw new Error('The deck ran out while dealing.');
    }
    hands[seat].push(card);
    seat = leftOf(seat, count);
  }
  const flipped = drawPile.pop();
  if (flipped === undefined) {
    throw new Error('No card left to start the discard pile.');
  }
  return { hands, drawPile, discardPile: [flipped] };
}
