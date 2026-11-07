import { Card } from '@ui/Card';

import { ROUND_BASICS, SECTION_IDS, SECTION_TITLES } from '../constants';
import { SectionHeading } from './SectionHeading';
import { TurnSteps } from './TurnSteps';

export function HowToPlay() {
  return (
    <section id={SECTION_IDS.how} className="flex scroll-mt-6 flex-col gap-7">
      <SectionHeading>{SECTION_TITLES.how}</SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        {ROUND_BASICS.map((item) => (
          <Card key={item.title} variant="subtle" className="gap-2.5">
            <h3 className="text-lg font-bold text-ink">{item.title}</h3>
            <p className="text-[15px] leading-relaxed text-body">{item.body}</p>
          </Card>
        ))}
      </div>
      <TurnSteps />
    </section>
  );
}
