import type { Card } from '@features/game-engine';

import { assertNever } from '@lib/assertNever';
import type { CardTone } from '@ui/CardFace';

export function cardFace(card: Card): { tone: CardTone; label: string } {
  switch (card.kind) {
    case 'number':
      return { tone: card.color, label: String(card.value) };
    case 'wild':
      return { tone: 'wild', label: 'W' };
    case 'skip':
      return { tone: 'skip', label: 'SKIP' };
    default:
      return assertNever(card);
  }
}

export function cardName(card: Card): string {
  switch (card.kind) {
    case 'number':
      return `${card.color} ${card.value}`;
    case 'wild':
      return 'Wild';
    case 'skip':
      return 'Skip';
    default:
      return assertNever(card);
  }
}

export function cardsName(cards: readonly Card[]): string {
  const [only] = cards;
  return cards.length === 1 && only !== undefined ? cardName(only) : `${cards.length} cards`;
}

export function cardLabel(card: Card, isSelected: boolean): string {
  return isSelected ? `${cardName(card)}, selected` : cardName(card);
}
