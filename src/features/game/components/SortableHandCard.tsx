import { flushSync } from 'react-dom';

import { useSortable } from '@dnd-kit/react/sortable';

import type { Card } from '@features/game-engine';

import { nudgeTarget } from '../handOrder';
import type { DragItem } from '../turnMoves';
import { HandCard } from './HandCard';

type SortableHandCardProps = {
  card: Card;
  index: number;
  item: DragItem;
  isCarried: boolean;
  isSelected: boolean;
  disabled: boolean;
  canArrange: boolean;
  describedBy: string;
  onToggle: () => void;
  onNudge: (target: number) => void;
};

export function SortableHandCard(props: SortableHandCardProps) {
  const { card, index, item, isCarried, isSelected, disabled, canArrange, describedBy } = props;
  const { onToggle, onNudge } = props;
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    disabled: !canArrange,
    data: { item, zone: { kind: 'hand' } },
  });

  return (
    <li ref={ref} className={`select-none ${isDragging ? 'z-10' : ''}`}>
      <HandCard
        card={card}
        isDragging={isDragging}
        isCarried={isCarried}
        describedBy={canArrange ? describedBy : undefined}
        isSelected={isSelected}
        disabled={disabled}
        canDrag={canArrange}
        onToggle={onToggle}
        onNudge={(event) => {
          const target = nudgeTarget(event.key, index);
          if (!canArrange || !event.altKey || target === null) {
            return;
          }
          // Alt + Left is the browser's Back shortcut, so the default must be stopped.
          event.preventDefault();
          // React re-inserts a moved card's node, which drops focus, so it's put back after the move.
          const button = event.currentTarget;
          flushSync(() => onNudge(target));
          button.focus();
        }}
      />
    </li>
  );
}
