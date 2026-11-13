import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

import { TURN_COPY } from '../constants';
import type { TurnState } from '../hooks/useTurnState';

type TurnActionsProps = {
  turn: TurnState;
};

export function TurnActions({ turn }: TurnActionsProps) {
  const canLay = turn.canAct && !turn.player.hasLaidDown;
  const canDiscard = turn.canAct && turn.mode === 'play' && turn.selected.length === 1;

  return (
    <div className="flex flex-wrap justify-end gap-3 border-t border-table-raised pt-4">
      {turn.mode === 'laying' ? (
        <>
          <Button variant="secondary" onDark onClick={turn.cancelLaying}>
            {TURN_COPY.cancel}
          </Button>
          <Button onDark disabled={turn.selected.length === 0} onClick={turn.confirmPhase}>
            {TURN_COPY.confirmPhase(turn.selected.length)}
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" onDark disabled={!canLay} onClick={turn.startLaying}>
            {TURN_COPY.layDown}
          </Button>
          <Button onDark disabled={!canDiscard} onClick={() => turn.discardSelected()}>
            {TURN_COPY.discard}
          </Button>
        </>
      )}
      <Button
        variant="inverse"
        onDark
        disabled={!turn.isDone}
        onClick={turn.nextPlayer}
        endIcon={turn.isDone ? <Icon src={arrowRightIcon} /> : undefined}
      >
        {TURN_COPY.nextPlayer}
      </Button>
    </div>
  );
}
