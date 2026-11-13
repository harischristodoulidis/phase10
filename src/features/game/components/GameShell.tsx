import type { ReactNode } from 'react';

import { currentPlayer, type GameState } from '@features/game-engine';
import { Scoreboard } from '@features/scoreboard';

import { dealerOf } from '../turnInfo';
import { TurnHeader } from './TurnHeader';

type GameShellProps = {
  game: GameState;
  nextPlayerId: string | null;
  onRules: () => void;
  onReset: () => void;
  children: ReactNode;
};

export function GameShell({ game, nextPlayerId, onRules, onReset, children }: GameShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TurnHeader
        round={game.round}
        dealer={dealerOf(game).name}
        drawCount={game.drawPile.length}
        onRules={onRules}
        onReset={onReset}
      />
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-wrap gap-5 px-4 pt-5 pb-6 sm:px-6">
        {children}
        <Scoreboard
          players={game.players}
          currentPlayerId={currentPlayer(game).id}
          nextPlayerId={nextPlayerId}
          className="min-w-0 flex-[1_1_280px]"
        />
      </div>
    </div>
  );
}
