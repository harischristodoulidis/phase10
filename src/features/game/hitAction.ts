import { runRange, type Card, type Group, type GroupRequirement } from '@features/game-engine';

import { assertNever } from '@lib/assertNever';

import { cardsName } from './cardView';
import { TURN_COPY } from './constants';

export function groupLabel(group: Group): string {
  return TURN_COPY.groupLabel(group.type, group.cards.length);
}

// Tells apart two groups with the same label, such as two sets of 3.
export function groupDetail(group: Group): string {
  const number = group.cards.find((card) => card.kind === 'number');
  if (number === undefined || number.kind !== 'number') {
    return '';
  }
  switch (group.type) {
    case 'set':
      return TURN_COPY.setDetail(number.value);
    case 'run': {
      const { min, max } = runRange(group);
      return TURN_COPY.runDetail(min, max);
    }
    case 'color':
      return number.color;
    default:
      return assertNever(group.type);
  }
}

export type SlotEntry = { id: string; slot: number; requirement: GroupRequirement };

// A phase's slots are fixed for the round, so their position is their identity.
export function slotEntries(slots: readonly GroupRequirement[]): SlotEntry[] {
  return slots.map((requirement, slot) => ({ id: `slot-${slot + 1}`, slot, requirement }));
}

export function hitLabel(cards: readonly Card[], group: Group, owner: string | null): string {
  return TURN_COPY.hitLabel(cardsName(cards), groupLabel(group), groupDetail(group), owner);
}
