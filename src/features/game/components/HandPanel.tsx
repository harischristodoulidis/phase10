import { useId } from 'react';

import { TURN_COPY } from '../constants';
import type { TurnState } from '../hooks/useTurnState';
import { Hand } from './Hand';
import { TurnActions } from './TurnActions';

type HandPanelProps = {
  turn: TurnState;
};

export function HandPanel({ turn }: HandPanelProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="mt-auto flex flex-col gap-4 rounded-[20px] bg-table-deep p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={headingId} className="text-sm font-semibold text-table-muted">
          {TURN_COPY.hand(turn.hand.length)}
        </h2>
        <p role="status" className="text-[15px] text-white">
          {turn.hint}
        </p>
      </div>
      <Hand turn={turn} labelledBy={headingId} />
      <TurnActions turn={turn} />
    </section>
  );
}
