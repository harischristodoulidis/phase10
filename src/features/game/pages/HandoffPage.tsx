import { useAppDispatch } from '@app/hooks';
import { currentPlayer, type GameState } from '@features/game-engine';

import { GameShell } from '../components/GameShell';
import { HandoffTable } from '../components/HandoffTable';
import { HANDOFF_COPY } from '../constants';
import { gameReset, handRevealed } from '../gameSlice';
import { nextPlayerId } from '../turnInfo';

type HandoffPageProps = {
  game: GameState;
};

export function HandoffPage({ game }: HandoffPageProps) {
  const dispatch = useAppDispatch();
  const player = currentPlayer(game);

  return (
    <>
      <title>{HANDOFF_COPY.pageTitle(player.name)}</title>
      <GameShell
        game={game}
        nextPlayerId={nextPlayerId(game)}
        onReset={() => dispatch(gameReset())}
      >
        <HandoffTable
          player={player}
          lastAction={game.lastAction}
          onReveal={() => dispatch(handRevealed())}
        />
      </GameShell>
    </>
  );
}
