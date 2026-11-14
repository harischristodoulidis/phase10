import { getPhase, type Player } from '@features/game-engine';

import eyeIcon from '@assets/icons/eye.svg';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

import { HANDOFF_COPY } from '../constants';
import { TableStage } from './TableStage';

type HandoffTableProps = {
  player: Player;
  lastAction: string | null;
  onReveal: () => void;
};

const CARD_BACKS = ['-rotate-10', 'rotate-0', 'rotate-10'] as const;

export function HandoffTable({ player, lastAction, onReveal }: HandoffTableProps) {
  return (
    <TableStage
      decor={
        <div aria-hidden="true" className="flex gap-2.5">
          {CARD_BACKS.map((rotation) => (
            <div
              key={rotation}
              className={`h-[104px] w-[72px] rounded-xl border-3 border-surface bg-table-back ${rotation}`}
            />
          ))}
        </div>
      }
      status={HANDOFF_COPY.status(lastAction)}
      title={HANDOFF_COPY.title(player.name)}
      subtitle={HANDOFF_COPY.details(
        player.phase,
        getPhase(player.phase).label,
        player.hand.length
      )}
      hint={HANDOFF_COPY.hint(player.name)}
    >
      <Button variant="inverse" size="lg" onDark onClick={onReveal}>
        <Icon src={eyeIcon} size={22} />
        {HANDOFF_COPY.reveal(player.name)}
      </Button>
    </TableStage>
  );
}
