import type { Card, Player } from '@features/game-engine';

import { TURN_COPY } from '../constants';
import { groupLabel, hitAction } from '../hitAction';
import { GroupCards } from './GroupCards';
import { HitButton } from './HitButton';

type OpponentTileProps = {
  opponent: Player;
  hitCard: Card | undefined;
  onHit: (groupId: string) => void;
};

export function OpponentTile({ opponent, hitCard, onHit }: OpponentTileProps) {
  return (
    <li className="flex flex-col gap-3 rounded-[14px] bg-table-raised px-4 py-3.5 text-sm">
      <div className="flex justify-between gap-2">
        <span className="font-semibold">{opponent.name}</span>
        <span className="text-table-muted">
          {TURN_COPY.opponentStatus(opponent.hand.length, opponent.hasLaidDown)}
        </span>
      </div>
      {opponent.laidGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] text-table-muted">{groupLabel(group)}</span>
            <HitButton hit={hitAction(hitCard, group, opponent.name, onHit)} />
          </div>
          <GroupCards cards={group.cards} size="sm" />
        </div>
      ))}
    </li>
  );
}
