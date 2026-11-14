import type { Card } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace } from '../cardView';

type SelectionStackProps = {
  cards: readonly Card[];
};

const CARD_WIDTH = 72;
const SPREAD = 22;

export function SelectionStack({ cards }: SelectionStackProps) {
  return (
    <div
      aria-hidden="true"
      className="relative h-26 cursor-grabbing"
      style={{ width: `${CARD_WIDTH + SPREAD * (cards.length - 1)}px` }}
    >
      {cards.map((card, i) => (
        <span
          key={card.id}
          className="absolute top-0 rounded-xl"
          style={{ left: `${SPREAD * i}px`, rotate: `${(i - (cards.length - 1) / 2) * 4}deg` }}
        >
          <CardFace {...cardFace(card)} />
        </span>
      ))}
      <span className="absolute -top-2.5 -right-2.5 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-focus text-sm font-bold text-ink">
        {cards.length}
      </span>
    </div>
  );
}
