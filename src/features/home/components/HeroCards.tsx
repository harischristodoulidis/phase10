import { CardFace } from '@ui/CardFace';

import { HERO_CARDS } from '../constants';

export function HeroCards() {
  return (
    <div aria-hidden="true" className="relative h-80 min-w-0 flex-[1_1_380px]">
      {HERO_CARDS.map((card) => (
        <CardFace
          key={card.label}
          tone={card.tone}
          label={card.label}
          className={`absolute scale-125 sm:scale-150 ${card.className}`}
        />
      ))}
    </div>
  );
}
