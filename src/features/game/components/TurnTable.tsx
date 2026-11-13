import type { GameState } from '@features/game-engine';

import type { TurnState } from '../hooks/useTurnState';
import { opponentsOf } from '../turnInfo';
import { HandPanel } from './HandPanel';
import { OpponentList } from './OpponentList';
import { PhaseSlots } from './PhaseSlots';
import { Piles } from './Piles';
import { TurnHeading } from './TurnHeading';

type TurnTableProps = {
  game: GameState;
  turn: TurnState;
};

export function TurnTable({ game, turn }: TurnTableProps) {
  return (
    <main className="flex min-w-0 flex-[999_1_640px] flex-col gap-[22px] rounded-3xl bg-table p-4 text-white focus-ring-dark sm:p-6">
      <TurnHeading player={turn.player} />
      <div className="flex flex-wrap items-start gap-6">
        <Piles
          topDiscard={turn.pendingCard ?? game.discardPile.at(-1)}
          canDrawDeck={turn.canDrawDeck}
          canTakeDiscard={turn.canTakeDiscard}
          onDraw={turn.draw}
        />
        <PhaseSlots turn={turn} />
      </div>
      <OpponentList opponents={opponentsOf(game)} hitCard={turn.hitCard} onHit={turn.hitGroup} />
      <HandPanel turn={turn} />
    </main>
  );
}
