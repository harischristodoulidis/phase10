import { Navigate } from 'react-router';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { currentPlayer } from '@features/game-engine';

import { assertNever } from '@lib/assertNever';

import { InterimScreen } from '../components/InterimScreen';
import { INTERIM_COPY } from '../constants';
import { gameReset, nextRoundStarted } from '../gameSlice';
import { selectGame } from '../selectors';
import { HandoffPage } from './HandoffPage';
import { TurnPage } from './TurnPage';

export function GamePage() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGame);

  if (game === null) {
    return <Navigate to="/setup" replace />;
  }
  const player = currentPlayer(game);

  switch (game.view) {
    case 'turn':
      return <TurnPage game={game} />;
    case 'handoff':
      return <HandoffPage game={game} />;
    case 'roundSummary':
      return (
        <InterimScreen
          title={INTERIM_COPY.roundTitle(game.round)}
          message={game.lastAction}
          actionLabel={INTERIM_COPY.roundAction}
          onAction={() => dispatch(nextRoundStarted())}
        />
      );
    case 'gameOver': {
      const winner = game.players.find((p) => p.id === game.winnerId) ?? player;
      return (
        <InterimScreen
          title={INTERIM_COPY.gameOverTitle(winner.name)}
          message={game.lastAction}
          actionLabel={INTERIM_COPY.gameOverAction}
          onAction={() => dispatch(gameReset())}
        />
      );
    }
    default:
      return assertNever(game.view);
  }
}
