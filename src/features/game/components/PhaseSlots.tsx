import { useId } from 'react';

import { TURN_COPY } from '../constants';
import { hitAction, phaseSlots } from '../hitAction';
import type { TurnState } from '../hooks/useTurnState';
import { GroupCards } from './GroupCards';
import { HitButton } from './HitButton';

type PhaseSlotsProps = {
  turn: TurnState;
};

export function PhaseSlots({ turn }: PhaseSlotsProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-[1_1_340px] flex-col gap-2.5">
      <h2 id={headingId} className="text-sm font-semibold text-table-muted">
        {TURN_COPY.phaseOnTable}
      </h2>
      <ul className="flex flex-wrap gap-3">
        {phaseSlots(turn.player).map((slot) => (
          <li
            key={slot.id}
            className="flex min-h-[120px] min-w-0 flex-[1_1_220px] flex-col gap-2.5 rounded-2xl border-2 border-dashed border-table-line p-3.5"
          >
            <div className="flex min-h-11 items-center justify-between gap-2">
              <span className="text-[13px] text-table-muted">{slot.label}</span>
              <HitButton hit={hitAction(turn.hitCard, slot.group, null, turn.hitGroup)} />
            </div>
            <GroupCards cards={slot.cards} size="slot" />
          </li>
        ))}
      </ul>
    </section>
  );
}
