export type SeatTone = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'ink';

type SeatBadgeProps =
  | { variant: 'badge'; tone: SeatTone; seat: number }
  | { variant: 'dot'; tone: SeatTone; isRinged?: boolean };

const FILL_CLASSES = {
  red: 'bg-card-red text-white',
  blue: 'bg-card-blue text-white',
  green: 'bg-card-green text-white',
  yellow: 'bg-card-yellow text-ink',
  purple: 'bg-card-skip text-white',
  ink: 'bg-card-wild text-white',
} as const satisfies Record<SeatTone, string>;

export function SeatBadge(props: SeatBadgeProps) {
  const fill = FILL_CLASSES[props.tone];
  if (props.variant === 'dot') {
    const ring = props.isRinged === true ? 'ring-2 ring-surface' : '';
    return <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${fill} ${ring}`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold ${fill}`}
    >
      {props.seat}
    </span>
  );
}
