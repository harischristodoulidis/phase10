import type { Card } from '@features/game-engine';

import { CardFace, type CardFaceSize } from '@ui/CardFace';

import { cardFace, cardName } from '../cardView';

type GroupCardsProps = {
  cards: readonly Card[];
  size: CardFaceSize;
};

export function GroupCards({ cards, size }: GroupCardsProps) {
  if (cards.length === 0) {
    return null;
  }
  return (
    <div>
      <span className="sr-only">{cards.map(cardName).join(', ')}</span>
      <div aria-hidden="true" className="flex flex-wrap gap-1.5">
        {cards.map((card) => (
          <CardFace key={card.id} size={size} {...cardFace(card)} />
        ))}
      </div>
    </div>
  );
}
