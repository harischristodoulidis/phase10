import type { Player } from '@features/game-engine';

import { TURN_COPY } from '../constants';
import type { TurnState } from '../hooks/useTurnState';
import { GroupTarget } from './GroupTarget';

type OpponentTileProps = {
  turn: TurnState;
  opponent: Player;
};

export function OpponentTile({ turn, opponent }: OpponentTileProps) {
  return (
    <li className="flex flex-col gap-3 rounded-[14px] bg-table-raised px-4 py-3.5 text-sm">
      <div className="flex justify-between gap-2">
        <span className="font-semibold">{opponent.name}</span>
        <span className="text-table-muted">
          {TURN_COPY.opponentStatus(opponent.hand.length, opponent.hasLaidDown)}
        </span>
      </div>
      {opponent.laidGroups.map((group) => (
        <GroupTarget
          key={group.id}
          turn={turn}
          group={group}
          owner={opponent.name}
          variant="tile"
        />
      ))}
    </li>
  );
}
