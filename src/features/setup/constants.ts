import { SEAT_COLORS, type PlayerCount, type SeatColor } from '@features/game-engine';

export const PLAYER_COUNTS = [2, 3, 4, 5, 6] as const satisfies readonly PlayerCount[];
export const MAX_PLAYERS = SEAT_COLORS.length;
export const DEFAULT_PLAYER_COUNT: PlayerCount = 4;
export const MAX_NAME_LENGTH = 20;

export const SEAT_BADGE_CLASSES = {
  red: 'bg-card-red text-white',
  blue: 'bg-card-blue text-white',
  green: 'bg-card-green text-white',
  yellow: 'bg-card-yellow text-ink',
  purple: 'bg-card-skip text-white',
  ink: 'bg-ink text-white',
} as const satisfies Record<SeatColor, string>;

export const SETUP_COPY = {
  title: 'Set up the game',
  pageTitle: 'Set up · Phase 10',
  backLink: 'Rules',
  countHeading: 'How many players?',
  namesHeading: 'Player names',
  dealsFirst: 'Deals first',
  placeholder: (seat: number) => `Player ${seat}`,
  nameLabel: (seat: number) => `Player ${seat} name`,
} as const;
