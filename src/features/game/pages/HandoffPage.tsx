import { useState } from 'react';

import { useAppDispatch } from '@app/hooks';
import { currentPlayer, type GameState } from '@features/game-engine';
import { RulesModal } from '@features/rules';

import { GameShell } from '../components/GameShell';
import { HandoffTable } from '../components/HandoffTable';
import { ResetGameDialog } from '../components/ResetGameDialog';
import { HANDOFF_COPY } from '../constants';
import { gameReset, handRevealed } from '../gameSlice';
import { nextPlayerId } from '../turnInfo';

type HandoffPageProps = {
  game: GameState;
};

type HandoffDialog = 'rules' | 'reset' | null;

export function HandoffPage({ game }: HandoffPageProps) {
  const dispatch = useAppDispatch();
  const [dialog, setDialog] = useState<HandoffDialog>(null);
  const player = currentPlayer(game);
  const closeDialog = () => setDialog(null);

  return (
    <>
      <title>{HANDOFF_COPY.pageTitle(player.name)}</title>
      <GameShell
        game={game}
        nextPlayerId={nextPlayerId(game)}
        onRules={() => setDialog('rules')}
        onReset={() => setDialog('reset')}
      >
        <HandoffTable
          player={player}
          lastAction={game.lastAction}
          onReveal={() => dispatch(handRevealed())}
        />
      </GameShell>
      <RulesModal open={dialog === 'rules'} onClose={closeDialog} currentPhase={player.phase} />
      <ResetGameDialog
        open={dialog === 'reset'}
        onClose={closeDialog}
        onConfirm={() => dispatch(gameReset())}
      />
    </>
  );
}
