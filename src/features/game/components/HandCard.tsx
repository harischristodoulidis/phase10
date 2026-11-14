import type { KeyboardEvent } from 'react';

import type { Card } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace, cardLabel } from '../cardView';

type HandCardProps = {
  card: Card;
  isSelected: boolean;
  isDragging: boolean;
  disabled: boolean;
  describedBy: string | undefined;
  onToggle: () => void;
  onNudge: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

// aria-disabled rather than disabled: a disabled button gets no pointer events, so it couldn't be dragged.
export function HandCard(props: HandCardProps) {
  const { card, isSelected, isDragging, disabled, describedBy, onToggle, onNudge } = props;
  const { tone, label } = cardFace(card);
  const lift = isSelected || isDragging ? '-translate-y-[18px] shadow-card-lifted' : 'shadow-card';

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={cardLabel(card, isSelected)}
      aria-disabled={disabled}
      aria-describedby={describedBy}
      onClick={disabled ? undefined : onToggle}
      onKeyDown={onNudge}
      className={`rounded-xl transition-transform aria-disabled:cursor-default ${lift}`}
    >
      <CardFace tone={tone} label={label} />
    </button>
  );
}
