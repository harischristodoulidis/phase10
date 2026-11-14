import type { Player } from '@features/game-engine';

import { Button } from '@ui/Button';
import { Modal } from '@ui/Modal';
import { SeatBadge } from '@ui/SeatBadge';

import { SKIP_COPY } from '../constants';

type SkipTargetDialogProps = {
  open: boolean;
  onClose: () => void;
  opponents: readonly Player[];
  targets: readonly Player[];
  onPick: (target: Player) => void;
};

export function SkipTargetDialog({
  open,
  onClose,
  opponents,
  targets,
  onPick,
}: SkipTargetDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={SKIP_COPY.title}
      description={SKIP_COPY.description}
      actions={
        <Button variant="secondary" onClick={onClose}>
          {SKIP_COPY.cancel}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {opponents.map((opponent) => {
          const isTarget = targets.some((target) => target.id === opponent.id);
          return (
            <li key={opponent.id}>
              <button
                type="button"
                disabled={!isTarget}
                onClick={() => onPick(opponent)}
                className="flex min-h-13 w-full items-center justify-between gap-3 rounded-xl border border-line-strong bg-subtle px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2.5">
                  <SeatBadge variant="dot" tone={opponent.color} />
                  {opponent.name}
                </span>
                <span className="text-[13px] font-medium text-muted">
                  {isTarget ? SKIP_COPY.available : SKIP_COPY.used}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
