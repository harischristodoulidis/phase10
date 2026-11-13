import type { SeatColor } from '@features/game-engine';

import { Badge } from '@ui/Badge';
import { SeatBadge } from '@ui/SeatBadge';

import { MAX_NAME_LENGTH, SETUP_COPY } from '../constants';

type PlayerNameInputProps = {
  seat: number;
  color: SeatColor;
  name: string;
  isDealer: boolean;
  onChange: (name: string) => void;
};

export function PlayerNameInput({ seat, color, name, isDealer, onChange }: PlayerNameInputProps) {
  const id = `player-name-${seat}`;
  const seatNumber = seat + 1;
  return (
    <li className="flex items-center gap-3.5">
      <SeatBadge variant="badge" tone={color} seat={seatNumber} />
      <label htmlFor={id} className="sr-only">
        {SETUP_COPY.nameLabel(seatNumber)}
      </label>
      <input
        id={id}
        type="text"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        placeholder={SETUP_COPY.placeholder(seatNumber)}
        onChange={(e) => onChange(e.target.value)}
        className="h-13 w-full min-w-0 flex-1 rounded-xl border border-line-strong bg-field px-4 text-[17px] text-ink placeholder:text-muted"
      />
      {isDealer && <Badge size="sm">{SETUP_COPY.dealsFirst}</Badge>}
    </li>
  );
}
