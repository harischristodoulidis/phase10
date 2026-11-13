import type { Card } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace, cardLabel } from '../cardView';

type HandCardProps = {
  card: Card;
  isSelected: boolean;
  disabled: boolean;
  onToggle: () => void;
};

export function HandCard({ card, isSelected, disabled, onToggle }: HandCardProps) {
  const { tone, label } = cardFace(card);
  const lift = isSelected ? '-translate-y-[18px] shadow-card-lifted' : 'shadow-card';

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={cardLabel(card, isSelected)}
      disabled={disabled}
      onClick={onToggle}
      className={`rounded-xl transition-transform disabled:cursor-default ${lift}`}
    >
      <CardFace tone={tone} label={label} />
    </button>
  );
}
