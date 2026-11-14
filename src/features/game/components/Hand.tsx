import { useId } from 'react';

import { useDragOperation } from '@dnd-kit/react';

import { HAND_COPY } from '../constants';
import { itemOf } from '../dragData';
import { moveId } from '../handOrder';
import { useDropZone } from '../hooks/useDropZone';
import type { TurnState } from '../hooks/useTurnState';
import { SortableHandCard } from './SortableHandCard';

type HandProps = {
  turn: TurnState;
  labelledBy: string;
};

export function Hand({ turn, labelledBy }: HandProps) {
  const hintId = useId();
  const { dropRef, isValid, isOver } = useDropZone(turn, 'hand', { kind: 'hand' });
  const { source } = useDragOperation();
  const dragged = itemOf(source?.data);
  const carried = dragged?.kind === 'handCards' ? dragged.cardIds : [];
  const ids = turn.hand.map((card) => card.id);
  const highlight = isOver ? 'bg-table-raised' : isValid ? 'bg-table' : '';

  function handleNudge(index: number, target: number) {
    if (target >= 0 && target < ids.length) {
      turn.arrangeHand(moveId(ids, index, target));
    }
  }

  return (
    <>
      <p id={hintId} className="sr-only">
        {HAND_COPY.arrangeHint}
      </p>
      <ul
        ref={dropRef}
        aria-labelledby={labelledBy}
        className={`flex min-h-30.5 flex-wrap gap-2.5 rounded-2xl pt-4.5 transition-colors ${highlight}`}
      >
        {turn.hand.map((card, index) => (
          <SortableHandCard
            key={card.id}
            card={card}
            index={index}
            item={turn.dragItemFor(card.id)}
            isSelected={turn.selected.some((c) => c.id === card.id)}
            isCarried={carried.includes(card.id)}
            disabled={!turn.canAct}
            canArrange={turn.canArrange}
            describedBy={hintId}
            onToggle={() => turn.toggleCard(card.id)}
            onNudge={(target) => handleNudge(index, target)}
          />
        ))}
      </ul>
    </>
  );
}
