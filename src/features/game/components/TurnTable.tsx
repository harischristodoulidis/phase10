import type { GameState } from '@features/game-engine';

import type { TurnState } from '../hooks/useTurnState';
import { opponentsOf } from '../turnInfo';
import { HandPanel } from './HandPanel';
import { OpponentList } from './OpponentList';
import { PhaseSlots } from './PhaseSlots';
import { Piles } from './Piles';
import { TurnDragDrop } from './TurnDragDrop';
import { TurnHeading } from './TurnHeading';

type TurnTableProps = {
  game: GameState;
  turn: TurnState;
};

export function TurnTable({ game, turn }: TurnTableProps) {
  return (
    <main className="flex min-w-0 flex-[999_1_640px] flex-col gap-[22px] rounded-3xl bg-table p-4 text-white focus-ring-dark sm:p-6">
      <TurnHeading player={turn.player} />
      <TurnDragDrop turn={turn}>
        <div className="flex flex-wrap items-start gap-6">
          <Piles turn={turn} topDiscard={turn.pendingCard ?? game.discardPile.at(-1)} />
          <PhaseSlots turn={turn} />
        </div>
        <OpponentList turn={turn} opponents={opponentsOf(game)} />
        <HandPanel turn={turn} />
      </TurnDragDrop>
    </main>
  );
}
