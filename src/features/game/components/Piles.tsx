import type { Card } from '@features/game-engine';

import { TURN_COPY } from '../constants';
import type { TurnState } from '../hooks/useTurnState';
import { DiscardPile } from './DiscardPile';
import { Pile } from './Pile';

type PilesProps = {
  turn: TurnState;
  topDiscard: Card | undefined;
};

export function Piles({ turn, topDiscard }: PilesProps) {
  return (
    <div className="flex gap-5">
      <Pile
        item={{ kind: 'deck' }}
        caption={TURN_COPY.drawPile}
        actionLabel={TURN_COPY.drawPileAction}
        canDraw={turn.canDrawDeck}
        onTap={turn.canDrawDeck ? () => turn.draw('deck') : null}
      >
        <span className="flex h-[136px] w-24 flex-col items-center justify-center rounded-[14px] border-3 border-surface bg-table-back font-display text-[15px] font-bold tracking-[0.1em] text-white shadow-pile">
          {TURN_COPY.drawPileFace.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </Pile>
      <DiscardPile turn={turn} topDiscard={topDiscard} />
    </div>
  );
}
