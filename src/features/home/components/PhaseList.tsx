import { PHASES } from '@features/game-engine';

import { Card } from '@ui/Card';

import { SECTION_IDS, SECTION_TITLES } from '../constants';
import { SectionHeading } from './SectionHeading';

export function PhaseList() {
  const finalPhase = PHASES.length;
  return (
    <section id={SECTION_IDS.phases} className="flex scroll-mt-6 flex-col gap-7">
      <SectionHeading>{SECTION_TITLES.phases}</SectionHeading>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {PHASES.map(({ phase, label }) => (
          <Card
            as="li"
            key={phase}
            variant={phase === finalPhase ? 'inverse' : 'outlined'}
            padding="sm"
            className="gap-1.5"
          >
            <span className="font-display text-[28px] font-bold">
              <span className="sr-only">Phase </span>
              {phase}
              <span className="sr-only">:</span>
            </span>
            <span className="text-[15px]">{label}</span>
          </Card>
        ))}
      </ol>
    </section>
  );
}
