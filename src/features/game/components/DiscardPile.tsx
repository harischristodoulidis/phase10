import type { Card } from '@features/game-engine';

import { CardFace } from '@ui/CardFace';

import { cardFace, cardName, cardsName } from '../cardView';
import { TURN_COPY } from '../constants';
import { useDropZone } from '../hooks/useDropZone';
import type { TurnState } from '../hooks/useTurnState';
import { Pile } from './Pile';

type DiscardPileProps = {
  turn: TurnState;
  topDiscard: Card | undefined;
};

function actionLabel(turn: TurnState, topDiscard: Card | undefined): string {
  if (turn.selected.length > 1) {
    return TURN_COPY.discardOneAtATime;
  }
  if (turn.selected.length === 1) {
    return TURN_COPY.discardLabel(cardsName(turn.selected));
  }
  if (topDiscard === undefined) {
    return TURN_COPY.emptyDiscard;
  }
  if (turn.isDone) {
    return TURN_COPY.undoDiscardLabel(cardName(topDiscard));
  }
  return turn.canTakeDiscard
    ? `${TURN_COPY.discardPileAction}: ${cardName(topDiscard)}`
    : `${TURN_COPY.discardPile}: ${cardName(topDiscard)}`;
}

function tapAction(turn: TurnState, canTap: boolean): (() => void) | null {
  if (canTap) {
    return () => turn.tapZone({ kind: 'discard' });
  }
  if (turn.isDone) {
    return turn.undoDiscard;
  }
  return turn.canTakeDiscard ? () => turn.draw('discard') : null;
}

// Until Next player, the chosen discard can be dragged or tapped back into the hand.
export function DiscardPile({ turn, topDiscard }: DiscardPileProps) {
  const { dropRef, isValid, isOver, tapResolution } = useDropZone(turn, 'discard', {
    kind: 'discard',
  });
  const ring = isOver
    ? 'ring-4 ring-focus'
    : isValid
      ? 'ring-2 ring-focus ring-offset-4 ring-offset-table'
      : '';

  return (
    <div ref={dropRef} className={`relative rounded-[14px] transition-shadow ${ring}`}>
      <Pile
        item={{ kind: 'discardTop' }}
        caption={isValid ? TURN_COPY.discardDrop : TURN_COPY.discardPile}
        actionLabel={actionLabel(turn, topDiscard)}
        canDraw={turn.canTakeDiscard || turn.isDone}
        onTap={tapAction(turn, tapResolution !== null && tapResolution.kind !== 'none')}
      >
        {topDiscard === undefined ? (
          <span className="block h-34 w-24 rounded-[14px] border-2 border-dashed border-table-line" />
        ) : (
          <CardFace size="pile" {...cardFace(topDiscard)} />
        )}
      </Pile>
    </div>
  );
}
