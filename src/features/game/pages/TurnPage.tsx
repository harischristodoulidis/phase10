import { useAppDispatch } from '@app/hooks';
import { skipTargets, type GameState } from '@features/game-engine';

import { GameShell } from '../components/GameShell';
import { SkipTargetDialog } from '../components/SkipTargetDialog';
import { TurnTable } from '../components/TurnTable';
import { TURN_COPY } from '../constants';
import { gameReset } from '../gameSlice';
import { useTurnState } from '../hooks/useTurnState';
import { opponentsOf } from '../turnInfo';

type TurnPageProps = {
  game: GameState;
};

export function TurnPage({ game }: TurnPageProps) {
  const dispatch = useAppDispatch();
  const turn = useTurnState(game);

  return (
    <>
      <title>{TURN_COPY.pageTitle}</title>
      <GameShell game={game} nextPlayerId={turn.nextUpId} onReset={() => dispatch(gameReset())}>
        <TurnTable game={game} turn={turn} />
      </GameShell>
      <SkipTargetDialog
        open={turn.isPickingSkipTarget}
        onClose={turn.cancelSkipTarget}
        opponents={opponentsOf(game)}
        targets={skipTargets(game)}
        onPick={turn.pickSkipTarget}
      />
    </>
  );
}
