import { SeatBadge } from '@ui/SeatBadge';

import { ROW_GRID, SCOREBOARD_COPY } from '../constants';
import type { ScoreboardPlayer } from '../types';

type ScoreboardRowProps = {
  player: ScoreboardPlayer;
  isCurrent: boolean;
};

export function ScoreboardRow({ player, isCurrent }: ScoreboardRowProps) {
  return (
    <li
      aria-current={isCurrent ? 'true' : undefined}
      className={`${ROW_GRID} rounded-[14px] p-3 ${isCurrent ? 'bg-ink text-white' : 'bg-subtle text-ink'}`}
    >
      <span className="flex min-w-0 items-center gap-2.5 font-semibold">
        <SeatBadge variant="dot" tone={player.color} isRinged={isCurrent} />
        <span className="truncate">{player.name}</span>
      </span>
      <span className="text-center font-display font-bold">
        <span className="sr-only">{SCOREBOARD_COPY.phaseLabel}</span>
        {player.phase}
      </span>
      <span className="text-right font-semibold">
        {player.score}
        <span className="sr-only">{SCOREBOARD_COPY.pointsLabel}</span>
      </span>
    </li>
  );
}
