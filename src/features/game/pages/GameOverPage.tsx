import { useAppDispatch } from '@app/hooks';
import type { GameState } from '@features/game-engine';

import { GameOverTable } from '../components/GameOverTable';
import { GameShell } from '../components/GameShell';
import { GAME_OVER_COPY } from '../constants';
import { finalStandings } from '../finalStandings';
import { gameReset } from '../gameSlice';

type GameOverPageProps = {
  game: GameState;
};

export function GameOverPage({ game }: GameOverPageProps) {
  const dispatch = useAppDispatch();
  const result = finalStandings(game);
  const startOver = () => dispatch(gameReset());

  return (
    <>
      <title>{GAME_OVER_COPY.pageTitle(result.winner.name)}</title>
      <GameShell
        game={game}
        nextPlayerId={null}
        highlightedPlayerId={result.winner.id}
        isRoundOver
        onReset={startOver}
      >
        <GameOverTable round={game.round} result={result} onNewGame={startOver} />
      </GameShell>
    </>
  );
}
