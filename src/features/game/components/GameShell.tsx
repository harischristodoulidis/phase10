import { useState, type ReactNode } from 'react';

import { currentPlayer, type GameState } from '@features/game-engine';
import { RulesModal } from '@features/rules';
import { Scoreboard } from '@features/scoreboard';

import { TURN_COPY } from '../constants';
import { dealerOf } from '../turnInfo';
import { ResetGameDialog } from './ResetGameDialog';
import { TurnHeader } from './TurnHeader';

type GameShellProps = {
  game: GameState;
  nextPlayerId: string | null;
  highlightedPlayerId?: string;
  showsTableInfo?: boolean;
  onReset: () => void;
  children: ReactNode;
};

type HeaderDialog = 'rules' | 'reset' | null;

export function GameShell({
  game,
  nextPlayerId,
  highlightedPlayerId,
  showsTableInfo = true,
  onReset,
  children,
}: GameShellProps) {
  const [dialog, setDialog] = useState<HeaderDialog>(null);
  const player = currentPlayer(game);
  const closeDialog = () => setDialog(null);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <TurnHeader
          round={game.round}
          tableInfo={
            showsTableInfo ? TURN_COPY.tableInfo(dealerOf(game).name, game.drawPile.length) : null
          }
          onRules={() => setDialog('rules')}
          onReset={() => setDialog('reset')}
        />
        <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-wrap gap-5 px-4 pt-5 pb-6 sm:px-6">
          {children}
          <Scoreboard
            players={game.players}
            currentPlayerId={highlightedPlayerId ?? player.id}
            nextPlayerId={nextPlayerId}
            className="min-w-0 flex-[1_1_280px]"
          />
        </div>
      </div>
      <RulesModal open={dialog === 'rules'} onClose={closeDialog} currentPhase={player.phase} />
      <ResetGameDialog open={dialog === 'reset'} onClose={closeDialog} onConfirm={onReset} />
    </>
  );
}
