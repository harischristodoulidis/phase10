import { useAppDispatch } from '@app/hooks';
import type { GameState } from '@features/game-engine';

import { GameShell } from '../components/GameShell';
import { RoundSummaryTable } from '../components/RoundSummaryTable';
import { ROUND_COPY } from '../constants';
import { gameReset, nextRoundStarted } from '../gameSlice';
import { summarizeRound } from '../roundSummary';

type RoundSummaryPageProps = {
  game: GameState;
};

export function RoundSummaryPage({ game }: RoundSummaryPageProps) {
  const dispatch = useAppDispatch();
  const summary = summarizeRound(game);

  return (
    <>
      <title>{ROUND_COPY.pageTitle(game.round)}</title>
      <GameShell game={game} nextPlayerId={null} isRoundOver onReset={() => dispatch(gameReset())}>
        <RoundSummaryTable
          round={game.round}
          summary={summary}
          onDeal={() => dispatch(nextRoundStarted())}
        />
      </GameShell>
    </>
  );
}
