import { assertNever } from '@lib/assertNever';

import { MAX_CARD_VALUE, MIN_CARD_VALUE } from './constants';
import type { Card, Group, NumberCard } from './types';

function firstNumber(group: Group): { card: NumberCard; index: number } {
  const index = group.cards.findIndex((card) => card.kind === 'number');
  const card = group.cards[index];
  if (card === undefined || card.kind !== 'number') {
    throw new Error(`Group ${group.id} has no number card.`);
  }
  return { card, index };
}

export function runRange(group: Group): { min: number; max: number } {
  const { card, index } = firstNumber(group);
  const min = card.value - index;
  return { min, max: min + group.cards.length - 1 };
}

export function canHit(group: Group, card: Card): boolean {
  if (card.kind === 'skip') {
    return false;
  }
  switch (group.type) {
    case 'set':
      return card.kind === 'wild' || card.value === firstNumber(group).card.value;
    case 'color':
      return card.kind === 'wild' || card.color === firstNumber(group).card.color;
    case 'run': {
      const { min, max } = runRange(group);
      if (card.kind === 'wild') {
        return min > MIN_CARD_VALUE || max < MAX_CARD_VALUE;
      }
      return card.value === min - 1 || card.value === max + 1;
    }
    default:
      return assertNever(group.type);
  }
}

// Adds every card if some order fits; number cards go first so a Wild can't take a number's spot.
export function orderHits(group: Group, cards: readonly Card[]): Group | null {
  let current = group;
  let rest = [...cards];
  while (rest.length > 0) {
    const next =
      rest.find((card) => card.kind === 'number' && canHit(current, card)) ??
      rest.find((card) => canHit(current, card));
    if (next === undefined) {
      return null;
    }
    current = applyHit(current, next);
    rest = rest.filter((card) => card !== next);
  }
  return current;
}

// Expects canHit to have passed.
export function applyHit(group: Group, card: Card): Group {
  if (group.type !== 'run') {
    return { ...group, cards: [...group.cards, card] };
  }
  const { min, max } = runRange(group);
  const isBottom = card.kind === 'number' ? card.value === min - 1 : max === MAX_CARD_VALUE;
  return { ...group, cards: isBottom ? [card, ...group.cards] : [...group.cards, card] };
}
