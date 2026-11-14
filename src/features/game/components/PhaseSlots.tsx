import { useId } from 'react';

import { TURN_COPY } from '../constants';
import { slotEntries } from '../hitAction';
import type { TurnState } from '../hooks/useTurnState';
import { GroupTarget } from './GroupTarget';
import { PhaseSlot } from './PhaseSlot';

type PhaseSlotsProps = {
  turn: TurnState;
};

// Before laying down, the slots collect the phase card by card; afterwards they hold the laid groups.
export function PhaseSlots({ turn }: PhaseSlotsProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-[1_1_340px] flex-col gap-2.5">
      <h2 id={headingId} className="text-sm font-semibold text-table-muted">
        {TURN_COPY.phaseOnTable}
      </h2>
      <ul className="flex flex-wrap gap-3">
        {turn.player.hasLaidDown
          ? turn.player.laidGroups.map((group) => (
              <li key={group.id} className="flex min-w-0 flex-[1_1_220px] flex-col">
                <GroupTarget turn={turn} group={group} owner={null} variant="slot" />
              </li>
            ))
          : slotEntries(turn.slots).map(({ id, slot, requirement }) => (
              <PhaseSlot key={id} turn={turn} slot={slot} requirement={requirement} />
            ))}
      </ul>
    </section>
  );
}
