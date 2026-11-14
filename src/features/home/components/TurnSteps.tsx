import { Card } from '@ui/Card';

import { SECTION_TITLES, TURN_STEPS } from '../constants';

export function TurnSteps() {
  return (
    <>
      <h3 className="mt-4 font-display text-[22px] font-bold text-ink">{SECTION_TITLES.turn}</h3>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        {TURN_STEPS.map((step, i) => (
          <Card as="li" key={step.title} variant="outlined" className="gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-ink font-bold text-white"
            >
              {i + 1}
            </span>
            <strong className="text-[17px] text-ink">{step.title}</strong>
            <span className="text-[15px] leading-relaxed text-body">{step.body}</span>
          </Card>
        ))}
      </ol>
    </>
  );
}
