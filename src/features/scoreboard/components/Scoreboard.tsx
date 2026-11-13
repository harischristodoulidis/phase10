import { ROW_GRID, SCOREBOARD_COPY } from '../constants';
import type { ScoreboardPlayer } from '../types';
import { PhaseProgress } from './PhaseProgress';
import { ScoreboardRow } from './ScoreboardRow';

type ScoreboardProps = {
  players: readonly ScoreboardPlayer[];
  currentPlayerId: string;
  nextPlayerId: string | null;
  className?: string;
};

export function Scoreboard({
  players,
  currentPlayerId,
  nextPlayerId,
  className = '',
}: ScoreboardProps) {
  const current = players.find((player) => player.id === currentPlayerId);
  const next = players.find((player) => player.id === nextPlayerId);
  const { columns } = SCOREBOARD_COPY;

  return (
    <aside
      aria-label={SCOREBOARD_COPY.title}
      className={`flex flex-col gap-3.5 rounded-3xl bg-surface p-[22px] text-ink shadow-panel ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[22px] font-bold">{SCOREBOARD_COPY.title}</h2>
        <span className="text-[13px] text-muted">{SCOREBOARD_COPY.hint}</span>
      </div>
      <div
        aria-hidden="true"
        className={`${ROW_GRID} px-3 text-xs font-semibold tracking-[0.06em] text-muted uppercase`}
      >
        <span>{columns.player}</span>
        <span className="text-center">{columns.phase}</span>
        <span className="text-right">{columns.points}</span>
      </div>
      <ol className="flex flex-col gap-2">
        {players.map((player) => (
          <ScoreboardRow
            key={player.id}
            player={player}
            isCurrent={player.id === currentPlayerId}
          />
        ))}
      </ol>
      {current !== undefined && (
        <div className="flex flex-col gap-2.5 border-t border-line pt-3.5">
          <span className="text-[13px] font-semibold text-muted">
            {SCOREBOARD_COPY.progressTitle}
          </span>
          <PhaseProgress name={current.name} phase={current.phase} />
          {next !== undefined && (
            <span className="text-[13px] text-muted">{SCOREBOARD_COPY.nextUp(next.name)}</span>
          )}
        </div>
      )}
    </aside>
  );
}
