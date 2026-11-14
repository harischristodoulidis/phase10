import { getPhase, type Player } from '@features/game-engine';

import { focusOnMount } from '@lib/focusOnMount';

import { TURN_COPY } from '../constants';

type TurnHeadingProps = {
  player: Player;
};

export function TurnHeading({ player }: TurnHeadingProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold tracking-[0.06em] text-table-muted uppercase">
        {TURN_COPY.eyebrow}
      </span>
      <h1
        ref={focusOnMount}
        tabIndex={-1}
        className="font-display text-[34px] leading-tight font-bold outline-none"
      >
        {player.name}
      </h1>
      <p className="text-table-soft">
        {TURN_COPY.phase(player.phase)}
        <strong className="text-white">{getPhase(player.phase).label}</strong>
      </p>
    </div>
  );
}
