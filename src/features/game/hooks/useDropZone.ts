import { useDragOperation, useDroppable } from '@dnd-kit/react';

import { itemOf } from '../dragData';
import type { DropZone, Resolution } from '../turnMoves';
import type { TurnState } from './useTurnState';

type Highlight = { isValid: boolean; isOver: boolean };

export type DropZoneState = Highlight & {
  dropRef: (element: Element | null) => void;
  tapResolution: Resolution | null;
};

export function useDropZone(turn: TurnState, id: string, zone: DropZone): DropZoneState {
  const { ref, isDropTarget } = useDroppable({ id, data: { zone } });
  const { source } = useDragOperation();
  const item = itemOf(source?.data);
  const isValid = item !== null && turn.resolve(item, zone).kind === 'move';

  return {
    dropRef: ref,
    isValid,
    isOver: isValid && isDropTarget,
    tapResolution: turn.selection === null ? null : turn.resolve(turn.selection, zone),
  };
}

export function dropZoneClasses(
  { isValid, isOver }: Highlight,
  idle = 'border-table-line'
): string {
  if (isOver) {
    return 'border-solid border-focus bg-table-raised';
  }
  return isValid ? 'border-focus' : idle;
}
