import { getPhase, type Player } from '@features/game-engine';

import eyeIcon from '@assets/icons/eye.svg';
import { focusOnMount } from '@lib/focusOnMount';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

import { HANDOFF_COPY } from '../constants';

type HandoffTableProps = {
  player: Player;
  lastAction: string | null;
  onReveal: () => void;
};

const CARD_BACKS = ['-rotate-10', 'rotate-0', 'rotate-10'] as const;

export function HandoffTable({ player, lastAction, onReveal }: HandoffTableProps) {
  return (
    <main className="flex min-h-[640px] min-w-0 flex-[999_1_640px] flex-col items-center justify-center gap-7 rounded-3xl bg-table px-4 py-12 text-center text-white focus-ring-dark sm:px-8">
      <div aria-hidden="true" className="flex gap-2.5">
        {CARD_BACKS.map((rotation) => (
          <div
            key={rotation}
            className={`h-[104px] w-[72px] rounded-xl border-3 border-surface bg-table-back ${rotation}`}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <p className="text-[15px] text-table-muted">{HANDOFF_COPY.status(lastAction)}</p>
        <h1
          ref={focusOnMount}
          tabIndex={-1}
          className="font-display outline-none text-[44px] leading-tight font-bold tracking-[-0.01em] sm:text-[56px]"
        >
          {HANDOFF_COPY.title(player.name)}
        </h1>
        <p className="text-lg text-table-soft">
          {HANDOFF_COPY.details(player.phase, getPhase(player.phase).label, player.hand.length)}
        </p>
      </div>
      <Button variant="inverse" size="lg" onDark onClick={onReveal}>
        <Icon src={eyeIcon} size={22} />
        {HANDOFF_COPY.reveal(player.name)}
      </Button>
      <p className="text-sm text-table-muted">{HANDOFF_COPY.hint(player.name)}</p>
    </main>
  );
}
