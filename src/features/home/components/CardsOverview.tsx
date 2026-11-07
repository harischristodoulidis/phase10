import { CardFace } from '@ui/CardFace';

import { CARD_TYPES, SECTION_TITLES } from '../constants';
import { GroupExamples } from './GroupExamples';
import { SectionHeading } from './SectionHeading';

export function CardsOverview() {
  return (
    <section className="flex flex-col gap-7">
      <SectionHeading>{SECTION_TITLES.cards}</SectionHeading>
      <div className="flex flex-wrap items-start gap-10">
        {CARD_TYPES.map((type) => (
          <div key={type.title} className={`flex min-w-0 flex-col gap-3.5 ${type.basis}`}>
            <div aria-hidden="true" className="flex gap-2.5">
              {type.cards.map((card) => (
                <CardFace key={`${card.tone}-${card.label}`} tone={card.tone} label={card.label} />
              ))}
            </div>
            <strong className="text-[17px] text-ink">{type.title}</strong>
            <span className="text-[15px] leading-relaxed text-body">{type.body}</span>
          </div>
        ))}
      </div>
      <GroupExamples />
    </section>
  );
}
