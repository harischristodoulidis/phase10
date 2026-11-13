import type { Card } from '@features/game-engine';

import { HandCard } from './HandCard';

type HandProps = {
  cards: readonly Card[];
  selectedIds: readonly string[];
  disabled: boolean;
  labelledBy: string;
  onToggle: (cardId: string) => void;
};

export function Hand({ cards, selectedIds, disabled, labelledBy, onToggle }: HandProps) {
  return (
    <ul aria-labelledby={labelledBy} className="flex flex-wrap gap-2.5 pt-[18px]">
      {cards.map((card) => (
        <li key={card.id}>
          <HandCard
            card={card}
            isSelected={selectedIds.includes(card.id)}
            disabled={disabled}
            onToggle={() => onToggle(card.id)}
          />
        </li>
      ))}
    </ul>
  );
}
