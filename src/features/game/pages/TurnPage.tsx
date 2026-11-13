import { useAppDispatch } from '@app/hooks';
import { skipTargets, type GameState } from '@features/game-engine';
import { RulesModal } from '@features/rules';

import { GameShell } from '../components/GameShell';
import { ResetGameDialog } from '../components/ResetGameDialog';
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
      <GameShell
        game={game}
        nextPlayerId={turn.nextUpId}
        onRules={() => turn.openDialog('rules')}
        onReset={() => turn.openDialog('reset')}
      >
        <TurnTable game={game} turn={turn} />
      </GameShell>
      <RulesModal
        open={turn.dialog === 'rules'}
        onClose={turn.closeDialog}
        currentPhase={turn.player.phase}
      />
      <ResetGameDialog
        open={turn.dialog === 'reset'}
        onClose={turn.closeDialog}
        onConfirm={() => dispatch(gameReset())}
      />
      <SkipTargetDialog
        open={turn.dialog === 'skip'}
        onClose={turn.closeDialog}
        opponents={opponentsOf(game)}
        targets={skipTargets(game)}
        onPick={turn.discardSelected}
      />
    </>
  );
}
