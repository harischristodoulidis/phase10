import { useId } from 'react';

import type { Card, Player } from '@features/game-engine';

import { TURN_COPY } from '../constants';
import { OpponentTile } from './OpponentTile';

type OpponentListProps = {
  opponents: readonly Player[];
  hitCard: Card | undefined;
  onHit: (groupId: string) => void;
};

export function OpponentList({ opponents, hitCard, onHit }: OpponentListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <h2 id={headingId} className="text-sm font-semibold text-table-muted">
        {TURN_COPY.otherPlayers}
      </h2>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-start gap-3">
        {opponents.map((opponent) => (
          <OpponentTile key={opponent.id} opponent={opponent} hitCard={hitCard} onHit={onHit} />
        ))}
      </ul>
    </section>
  );
}
