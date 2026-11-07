import { assertNever } from '@lib/assertNever';

import type { Card } from './types';

export function cardPoints(card: Card): number {
  switch (card.kind) {
    case 'number':
      return card.value <= 9 ? 5 : 10;
    case 'skip':
      return 15;
    case 'wild':
      return 25;
    default:
      return assertNever(card);
  }
}

export function handPoints(hand: readonly Card[]): number {
  return hand.reduce((sum, card) => sum + cardPoints(card), 0);
}
