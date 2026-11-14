import { useDragOperation } from '@dnd-kit/react';

import type { GroupRequirement } from '@features/game-engine';

import { cardsName } from '../cardView';
import { TURN_COPY } from '../constants';
import { itemOf } from '../dragData';
import { dropZoneClasses, useDropZone } from '../hooks/useDropZone';
import type { TurnState } from '../hooks/useTurnState';
import { PlacedCard } from './PlacedCard';
import { TapTarget } from './TapTarget';

type PhaseSlotProps = {
  turn: TurnState;
  slot: number;
  requirement: GroupRequirement;
};

export function PhaseSlot({ turn, slot, requirement }: PhaseSlotProps) {
  const { dropRef, tapResolution, ...highlight } = useDropZone(turn, `slot-${slot}`, {
    kind: 'slot',
    slot,
  });
  const label = TURN_COPY.groupLabel(requirement.type, requirement.size);
  const cards = turn.placed[slot] ?? [];
  const { source } = useDragOperation();
  const dragged = itemOf(source?.data);
  const isCarried = dragged?.kind === 'slotCards' && dragged.slot === slot;

  return (
    <li
      ref={dropRef}
      className={`relative flex min-h-[120px] min-w-0 flex-[1_1_220px] flex-col gap-2.5 rounded-2xl border-2 border-dashed p-3.5 transition-colors ${dropZoneClasses(highlight)}`}
    >
      <span className="text-[13px] text-table-muted">
        {TURN_COPY.slotProgress(label, cards.length, requirement.size)}
      </span>
      {cards.length === 0 ? (
        <span className="text-[13px] text-table-soft">{TURN_COPY.slotEmpty}</span>
      ) : (
        <ul className="relative z-20 flex flex-wrap gap-1.5">
          {cards.map((card) => (
            <PlacedCard key={card.id} turn={turn} card={card} slot={slot} isCarried={isCarried} />
          ))}
        </ul>
      )}
      <TapTarget
        resolution={tapResolution}
        label={
          tapResolution?.kind === 'move' && tapResolution.move.kind === 'layDown'
            ? TURN_COPY.layDownLabel(turn.selected.length)
            : TURN_COPY.placeLabel(cardsName(turn.selected), slot + 1, label)
        }
        onTap={() => turn.tapZone({ kind: 'slot', slot })}
      />
    </li>
  );
}
