import type { ComponentProps, ReactNode } from 'react';

import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import {
  DragDropProvider,
  DragOverlay,
  useDragOperation,
  type DragDropEventHandlers,
} from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';

import { itemOf, zoneOf } from '../dragData';
import { moveId } from '../handOrder';
import type { TurnState } from '../hooks/useTurnState';
import { SelectionStack } from './SelectionStack';

type TurnDragDropProps = {
  turn: TurnState;
  children: ReactNode;
};

const sensors = [
  PointerSensor.configure({
    // Cards are buttons, which the sensor otherwise refuses to drag from.
    preventActivation: () => false,
    // A touch drag waits for a short press so a swipe still scrolls the page.
    activationConstraints(event) {
      return event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 })]
        : [new PointerActivationConstraints.Distance({ value: 8 })];
    },
  }),
];

// Its live region would clash with the turn hint's role="status".
const plugins: ComponentProps<typeof DragDropProvider>['plugins'] = (defaults) =>
  defaults.filter((plugin) => plugin !== Accessibility);

function DraggedStack({ turn }: { turn: TurnState }) {
  const { source } = useDragOperation();
  return <SelectionStack cards={turn.cardsOf(itemOf(source?.data))} />;
}

export function TurnDragDrop({ turn, children }: TurnDragDropProps) {
  const handleDragEnd: DragDropEventHandlers['onDragEnd'] = (event) => {
    if (event.canceled) {
      return;
    }
    const { source, target } = event.operation;
    const item = itemOf(source?.data);
    const zone = zoneOf(target?.data);
    if (item === null) {
      return;
    }
    // Keep the order the drag already showed on screen, so the screen and the state agree.
    const fromHand = item.kind === 'handCard' || item.kind === 'handCards';
    if (fromHand && isSortable(source) && source.initialIndex !== source.index) {
      const ids = turn.hand.map((card) => card.id);
      turn.arrangeHand(moveId(ids, source.initialIndex, source.index));
    }
    if (zone !== null && !(fromHand && zone.kind === 'hand')) {
      turn.drop(item, zone);
    }
  };

  return (
    <DragDropProvider sensors={sensors} plugins={plugins} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay
        disabled={(source) => turn.cardsOf(itemOf(source?.data)).length === 0}
        dropAnimation={null}
      >
        <DraggedStack turn={turn} />
      </DragOverlay>
    </DragDropProvider>
  );
}
