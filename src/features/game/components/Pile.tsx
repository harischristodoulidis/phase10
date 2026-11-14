import type { ReactNode } from 'react';

import { Feedback } from '@dnd-kit/dom';
import { useDraggable } from '@dnd-kit/react';

import type { DragItem } from '../turnMoves';

type PileProps = {
  item: DragItem;
  caption: string;
  actionLabel: string;
  canDraw: boolean;
  onTap: (() => void) | null;
  children: ReactNode;
};

const pilePlugins = [Feedback.configure({ feedback: 'clone' })];

export function Pile({ item, caption, actionLabel, canDraw, onTap, children }: PileProps) {
  const { ref } = useDraggable({
    id: item.kind,
    data: { item },
    disabled: !canDraw,
    plugins: pilePlugins,
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        ref={ref}
        type="button"
        aria-label={actionLabel}
        aria-disabled={onTap === null}
        onClick={onTap ?? undefined}
        className="cursor-pointer rounded-[14px] select-none aria-disabled:cursor-not-allowed"
      >
        {children}
      </button>
      <span className="text-[13px] text-table-muted">{caption}</span>
    </div>
  );
}
