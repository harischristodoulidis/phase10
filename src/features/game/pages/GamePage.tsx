import { Navigate } from 'react-router';

import { useAppSelector } from '@app/hooks';

import { assertNever } from '@lib/assertNever';

import { selectGame } from '../selectors';
import { GameOverPage } from './GameOverPage';
import { HandoffPage } from './HandoffPage';
import { RoundSummaryPage } from './RoundSummaryPage';
import { TurnPage } from './TurnPage';

export function GamePage() {
  const game = useAppSelector(selectGame);

  if (game === null) {
    return <Navigate to="/setup" replace />;
  }

  switch (game.view) {
    case 'turn':
      return <TurnPage game={game} />;
    case 'handoff':
      return <HandoffPage game={game} />;
    case 'roundSummary':
      return <RoundSummaryPage game={game} />;
    case 'gameOver':
      return <GameOverPage game={game} />;
    default:
      return assertNever(game.view);
  }
}
