import { CardFace } from '@ui/CardFace';

import { GAME_OVER_COPY } from '../constants';
import type { GameResult } from '../finalStandings';
import { ResultRow } from './ResultRow';
import { SummaryTable } from './SummaryTable';

type GameOverTableProps = {
  round: number;
  result: GameResult;
  onNewGame: () => void;
};

const FANNED_CARDS = [
  { tone: 'red', rotation: '-rotate-10' },
  { tone: 'blue', rotation: 'rotate-0' },
  { tone: 'green', rotation: 'rotate-10' },
] as const;

export function GameOverTable({ round, result, onNewGame }: GameOverTableProps) {
  return (
    <SummaryTable
      decor={
        <div aria-hidden="true" className="flex gap-2.5">
          {FANNED_CARDS.map(({ tone, rotation }) => (
            <CardFace
              key={tone}
              tone={tone}
              label={GAME_OVER_COPY.cardLabel}
              className={rotation}
            />
          ))}
        </div>
      }
      status={GAME_OVER_COPY.status(round)}
      title={GAME_OVER_COPY.title(result.winner.name)}
      subtitle={GAME_OVER_COPY.reasons[result.reason]}
      listTitle={GAME_OVER_COPY.standingsTitle}
      actionLabel={GAME_OVER_COPY.action}
      onAction={onNewGame}
      hint={GAME_OVER_COPY.hint}
    >
      {result.standings.map(({ player, isWinner, hasFinished }) => (
        <ResultRow
          key={player.id}
          player={player}
          badge={isWinner ? GAME_OVER_COPY.winner : null}
          detail={hasFinished ? GAME_OVER_COPY.finished : GAME_OVER_COPY.reached(player.phase)}
          value={String(player.score)}
          caption={GAME_OVER_COPY.points}
        />
      ))}
    </SummaryTable>
  );
}
