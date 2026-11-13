import type { Card, DrawSource } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace, cardName } from '../cardView';
import { TURN_COPY } from '../constants';
import { Pile } from './Pile';

type PilesProps = {
  topDiscard: Card | undefined;
  canDrawDeck: boolean;
  canTakeDiscard: boolean;
  onDraw: (source: DrawSource) => void;
};

export function Piles({ topDiscard, canDrawDeck, canTakeDiscard, onDraw }: PilesProps) {
  return (
    <div className="flex gap-5">
      <Pile
        caption={TURN_COPY.drawPile}
        actionLabel={TURN_COPY.drawPileAction}
        disabled={!canDrawDeck}
        onClick={() => onDraw('deck')}
      >
        <span className="flex h-[136px] w-24 flex-col items-center justify-center rounded-[14px] border-3 border-surface bg-table-back font-display text-[15px] font-bold tracking-[0.1em] text-white shadow-pile">
          {TURN_COPY.drawPileFace.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </Pile>
      <Pile
        caption={TURN_COPY.discardPile}
        actionLabel={
          topDiscard === undefined
            ? TURN_COPY.emptyDiscard
            : `${TURN_COPY.discardPileAction}: ${cardName(topDiscard)}`
        }
        disabled={!canTakeDiscard}
        onClick={() => onDraw('discard')}
      >
        {topDiscard === undefined ? (
          <span className="block h-[136px] w-24 rounded-[14px] border-2 border-dashed border-table-line" />
        ) : (
          <CardFace size="pile" {...cardFace(topDiscard)} />
        )}
      </Pile>
    </div>
  );
}
