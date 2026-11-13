import { canHit, getPhase, type Card, type Group, type Player } from '@features/game-engine';

import { cardName } from './cardView';
import { TURN_COPY } from './constants';

export type HitAction = { label: string; onHit: () => void };

export type TableGroup = { id: string; label: string; cards: readonly Card[]; group: Group | null };

export function groupLabel(group: Group): string {
  return TURN_COPY.groupLabel(group.type, group.cards.length);
}

// Before laying down, the slots show what the phase needs; afterwards, the laid groups.
export function phaseSlots(player: Player): TableGroup[] {
  if (player.hasLaidDown) {
    return player.laidGroups.map((group) => ({
      id: group.id,
      label: groupLabel(group),
      cards: group.cards,
      group,
    }));
  }
  return getPhase(player.phase).groups.map((requirement, slot) => ({
    id: `slot-${slot + 1}`,
    label: TURN_COPY.groupLabel(requirement.type, requirement.size),
    cards: [],
    group: null,
  }));
}

export function hitAction(
  card: Card | undefined,
  group: Group | null,
  owner: string | null,
  onHit: (groupId: string) => void
): HitAction | null {
  if (card === undefined || group === null || !canHit(group, card)) {
    return null;
  }
  return {
    label: TURN_COPY.hitLabel(cardName(card), groupLabel(group), owner),
    onHit: () => onHit(group.id),
  };
}
