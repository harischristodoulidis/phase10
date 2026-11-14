import { useId, type ComponentProps } from 'react';

import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { DragDropProvider, type DragDropEventHandlers } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';

import type { Card } from '@features/game-engine';

import { HAND_COPY } from '../constants';
import { moveId } from '../handOrder';
import { SortableHandCard } from './SortableHandCard';

type HandProps = {
  cards: readonly Card[];
  selectedIds: readonly string[];
  disabled: boolean;
  canArrange: boolean;
  labelledBy: string;
  onToggle: (cardId: string) => void;
  onArrange: (cardIds: string[]) => void;
};

// Touch waits for a short press so a swipe still scrolls the page; a mouse drags after a few pixels.
// Each card is a button, which the sensor would otherwise refuse to drag from.
const sensors = [
  PointerSensor.configure({
    preventActivation: () => false,
    activationConstraints(event) {
      return event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 })]
        : [new PointerActivationConstraints.Distance({ value: 8 })];
    },
  }),
];

// The card buttons carry their own hint, and the plugin's live region would clash with the turn hint.
const plugins: ComponentProps<typeof DragDropProvider>['plugins'] = (defaults) =>
  defaults.filter((plugin) => plugin !== Accessibility);

export function Hand(props: HandProps) {
  const { cards, selectedIds, disabled, canArrange, labelledBy, onToggle, onArrange } = props;
  const hintId = useId();
  const ids = cards.map((card) => card.id);

  const handleDragEnd: DragDropEventHandlers['onDragEnd'] = (event) => {
    const { source } = event.operation;
    if (!event.canceled && isSortable(source)) {
      onArrange(moveId(ids, source.initialIndex, source.index));
    }
  };

  function handleNudge(index: number, target: number) {
    if (target >= 0 && target < ids.length) {
      onArrange(moveId(ids, index, target));
    }
  }

  return (
    <DragDropProvider sensors={sensors} plugins={plugins} onDragEnd={handleDragEnd}>
      <p id={hintId} className="sr-only">
        {HAND_COPY.arrangeHint}
      </p>
      <ul aria-labelledby={labelledBy} className="flex flex-wrap gap-2.5 pt-[18px]">
        {cards.map((card, index) => (
          <SortableHandCard
            key={card.id}
            card={card}
            index={index}
            isSelected={selectedIds.includes(card.id)}
            disabled={disabled}
            canArrange={canArrange}
            describedBy={hintId}
            onToggle={() => onToggle(card.id)}
            onNudge={(target) => handleNudge(index, target)}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}
