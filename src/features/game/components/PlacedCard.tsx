import { useDraggable } from '@dnd-kit/react';

import type { Card } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace, cardName } from '../cardView';
import { TURN_COPY } from '../constants';
import type { TurnState } from '../hooks/useTurnState';

type PlacedCardProps = {
  turn: TurnState;
  card: Card;
  slot: number;
  isCarried: boolean;
};

// A card waiting in a phase slot: drag it out with its slot, or tap it to send just it back.
export function PlacedCard({ turn, card, slot, isCarried }: PlacedCardProps) {
  const { ref, isDragging } = useDraggable({
    id: `placed-${card.id}`,
    data: { item: turn.slotItem(slot, card.id) },
    disabled: !turn.canAct,
  });
  const fade = isCarried ? 'opacity-30' : '';

  return (
    <li className={`select-none ${isDragging ? 'z-20' : ''} ${fade}`}>
      <button
        ref={ref}
        type="button"
        aria-label={TURN_COPY.returnLabel(cardName(card))}
        aria-disabled={!turn.canAct}
        onClick={() => turn.drop({ kind: 'placedCard', cardId: card.id, slot }, { kind: 'hand' })}
        className="cursor-pointer rounded-[9px] aria-disabled:cursor-default"
      >
        <CardFace size="slot" {...cardFace(card)} />
      </button>
    </li>
  );
}
