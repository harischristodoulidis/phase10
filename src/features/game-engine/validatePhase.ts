import { assertNever } from '@lib/assertNever';

import { MAX_CARD_VALUE } from './constants';
import { phaseCardCount } from './phases';
import type {
  Card,
  Group,
  GroupRequirement,
  PhaseRequirement,
  Result,
  NumberCard,
  WildCard,
} from './types';

export type GroupDraft = Omit<Group, 'id'>;

export function validatePhase(
  cards: readonly Card[],
  requirement: PhaseRequirement
): Result<GroupDraft[]> {
  if (cards.some((card) => card.kind === 'skip')) {
    return { ok: false, reason: "A Skip can't be used in a phase." };
  }
  const count = phaseCardCount(requirement);
  if (cards.length !== count) {
    return { ok: false, reason: `Phase ${requirement.phase} needs exactly ${count} cards.` };
  }
  const numbers = cards.filter((card): card is NumberCard => card.kind === 'number');
  const wilds = cards.filter((card): card is WildCard => card.kind === 'wild');
  const groups = arrange(numbers, wilds, requirement.groups);
  if (groups === null) {
    return { ok: false, reason: `Not quite — these cards don't make ${requirement.label}.` };
  }
  return { ok: true, value: groups };
}

// Tries every way to split the number cards between the groups; Wilds fill the remaining slots.
function arrange(
  numbers: readonly NumberCard[],
  wilds: readonly WildCard[],
  requirements: readonly GroupRequirement[]
): GroupDraft[] | null {
  const groupCount = requirements.length;
  for (let n = 0; n < groupCount ** numbers.length; n++) {
    const buckets: NumberCard[][] = requirements.map(() => []);
    let rest = n;
    for (const card of numbers) {
      buckets[rest % groupCount].push(card);
      rest = Math.floor(rest / groupCount);
    }
    const isValid = requirements.every(
      (requirement, i) =>
        buckets[i].length >= 1 &&
        buckets[i].length <= requirement.size &&
        fits(buckets[i], requirement)
    );
    if (isValid) {
      let used = 0;
      return requirements.map((requirement, i) => {
        const slots = requirement.size - buckets[i].length;
        const group = buildGroup(buckets[i], wilds.slice(used, used + slots), requirement);
        used += slots;
        return group;
      });
    }
  }
  return null;
}

function fits(numbers: readonly NumberCard[], requirement: GroupRequirement): boolean {
  switch (requirement.type) {
    case 'set':
      return numbers.every((card) => card.value === numbers[0].value);
    case 'color':
      return numbers.every((card) => card.color === numbers[0].color);
    case 'run': {
      const values = numbers.map((card) => card.value);
      const span = Math.max(...values) - Math.min(...values) + 1;
      return new Set(values).size === values.length && span <= requirement.size;
    }
    default:
      return assertNever(requirement.type);
  }
}

function buildGroup(
  numbers: readonly NumberCard[],
  wilds: readonly WildCard[],
  requirement: GroupRequirement
): GroupDraft {
  switch (requirement.type) {
    case 'set':
      return { type: 'set', cards: [...numbers, ...wilds] };
    case 'color':
      return {
        type: 'color',
        cards: [...[...numbers].sort((a, b) => a.value - b.value), ...wilds],
      };
    case 'run':
      return { type: 'run', cards: orderRun(numbers, wilds, requirement.size) };
    default:
      return assertNever(requirement.type);
  }
}

// Wilds fill gaps first, then extend the run upward, and downward only past 12.
function orderRun(
  numbers: readonly NumberCard[],
  wilds: readonly WildCard[],
  size: number
): Card[] {
  const start = Math.min(Math.min(...numbers.map((card) => card.value)), MAX_CARD_VALUE - size + 1);
  const byValue = new Map<number, Card>(numbers.map((card) => [card.value, card]));
  const remainingWilds = [...wilds];
  return Array.from({ length: size }, (_, i) => {
    const card = byValue.get(start + i) ?? remainingWilds.shift();
    if (card === undefined) {
      throw new Error('Not enough Wilds to fill the run.');
    }
    return card;
  });
}
