import type { Player } from '@features/game-engine';

import { Badge } from '@ui/Badge';
import { SeatBadge } from '@ui/SeatBadge';

type ResultRowProps = {
  player: Pick<Player, 'name' | 'color'>;
  badge: string | null;
  detail: string;
  value: string;
  valueLabel?: string;
  caption: string;
};

export function ResultRow({ player, badge, detail, value, valueLabel, caption }: ResultRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[14px] bg-table-raised px-4 py-3.5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2.5 text-[15px] font-semibold">
          <SeatBadge variant="dot" tone={player.color} />
          <span className="min-w-0 break-words">{player.name}</span>
          {badge !== null && <Badge size="sm">{badge}</Badge>}
        </span>
        <span className="text-[13px] text-table-muted">{detail}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-display text-[22px] leading-tight font-bold">
          {value}
          {valueLabel !== undefined && <span className="sr-only">{valueLabel}</span>}
        </span>
        <span className="text-[13px] text-table-muted">{caption}</span>
      </div>
    </li>
  );
}
