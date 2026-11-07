import type { SeatColor } from '@features/game-engine';

import { Badge } from '@ui/Badge';

import { MAX_NAME_LENGTH, SEAT_BADGE_CLASSES, SETUP_COPY } from '../constants';

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
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${SEAT_BADGE_CLASSES[color]}`}
      >
        {seatNumber}
      </span>
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
        className="min-h-11 w-full min-w-0 rounded-xl border border-line-strong bg-surface px-4 text-ink placeholder:text-muted"
      />
      {isDealer && <Badge size="sm">{SETUP_COPY.dealsFirst}</Badge>}
    </li>
  );
}
