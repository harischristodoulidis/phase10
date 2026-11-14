import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

import { TURN_COPY } from '../constants';
import type { TurnState } from '../hooks/useTurnState';

type TurnActionsProps = {
  turn: TurnState;
};

export function TurnActions({ turn }: TurnActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3 border-t border-table-raised pt-4">
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
