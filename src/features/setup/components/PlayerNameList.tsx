import { SEAT_COLORS } from '@features/game-engine';

import { PlayerNameInput } from './PlayerNameInput';

type PlayerNameListProps = {
  names: readonly string[];
  onNameChange: (seat: number, name: string) => void;
  labelledBy: string;
};

export function PlayerNameList({ names, onNameChange, labelledBy }: PlayerNameListProps) {
  const dealerSeat = names.length - 1;
  return (
    <ol aria-labelledby={labelledBy} className="flex flex-col gap-3">
      {SEAT_COLORS.slice(0, names.length).map((color, seat) => (
        <PlayerNameInput
          key={color}
          seat={seat}
          color={color}
          name={names[seat] ?? ''}
          isDealer={seat === dealerSeat}
          onChange={(name) => onNameChange(seat, name)}
        />
      ))}
    </ol>
  );
}
