import { PHASES, type PhaseNumber } from '@features/game-engine';

import { SCOREBOARD_COPY } from '../constants';

type PhaseProgressProps = {
  name: string;
  phase: PhaseNumber;
};

export function PhaseProgress({ name, phase }: PhaseProgressProps) {
  return (
    <div
      role="img"
      aria-label={SCOREBOARD_COPY.progressLabel(name, phase, PHASES.length)}
      className="grid grid-cols-10 gap-1"
    >
      {PHASES.map((requirement) => (
        <span
          key={requirement.phase}
          className={`h-2 rounded-sm ${requirement.phase <= phase ? 'bg-ink' : 'bg-line'}`}
        />
      ))}
    </div>
  );
}
