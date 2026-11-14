import questionIcon from '@assets/icons/question.svg';
import resetIcon from '@assets/icons/reset.svg';
import { Badge } from '@ui/Badge';
import { HeaderButton } from '@ui/HeaderButton';
import { Icon } from '@ui/Icon';
import { Logo } from '@ui/Logo';

import { TURN_COPY } from '../constants';

type TurnHeaderProps = {
  round: number;
  tableInfo: string | null;
  onRules: () => void;
  onReset: () => void;
};

export function TurnHeader({ round, tableInfo, onRules, onReset }: TurnHeaderProps) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Logo />
          <Badge>{TURN_COPY.round(round)}</Badge>
          {tableInfo !== null && <span className="text-sm text-muted">{tableInfo}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <HeaderButton
            icon={<Icon src={questionIcon} size={18} />}
            aria-haspopup="dialog"
            onClick={onRules}
          >
            {TURN_COPY.rules}
          </HeaderButton>
          <HeaderButton
            tone="danger"
            icon={<Icon src={resetIcon} size={18} />}
            aria-haspopup="dialog"
            onClick={onReset}
          >
            {TURN_COPY.reset}
          </HeaderButton>
        </div>
      </div>
    </header>
  );
}
