import type { KeyboardEvent } from 'react';

import type { Card } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace, cardLabel } from '../cardView';

type HandCardProps = {
  card: Card;
  isSelected: boolean;
  isDragging: boolean;
  isCarried: boolean;
  disabled: boolean;
  canDrag: boolean;
  describedBy: string | undefined;
  onToggle: () => void;
  onNudge: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

function lift({ isSelected, isDragging, isCarried }: HandCardProps): string {
  if (isCarried) {
    return 'opacity-30 shadow-none';
  }
  return isSelected || isDragging ? '-translate-y-4.5 shadow-card-lifted' : 'shadow-card';
}

// aria-disabled rather than disabled: a disabled button gets no pointer events, so it couldn't be dragged.
export function HandCard(props: HandCardProps) {
  const { card, isSelected, disabled, canDrag, describedBy, onToggle, onNudge } = props;
  const { tone, label } = cardFace(card);
  const cursor = disabled && !canDrag ? 'cursor-default' : 'cursor-pointer';

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={cardLabel(card, isSelected)}
      aria-disabled={disabled}
      aria-describedby={describedBy}
      onClick={disabled ? undefined : onToggle}
      onKeyDown={onNudge}
      className={`rounded-xl transition ${cursor} ${lift(props)}`}
    >
      <CardFace tone={tone} label={label} />
    </button>
  );
}
