import { SEAT_COLORS, type PlayerCount } from '@features/game-engine';

export const PLAYER_COUNTS = [2, 3, 4, 5, 6] as const satisfies readonly PlayerCount[];
export const MAX_PLAYERS = SEAT_COLORS.length;
export const DEFAULT_PLAYER_COUNT: PlayerCount = 4;
export const MAX_NAME_LENGTH = 20;

export const SETUP_COPY = {
  title: 'Set up the game',
  pageTitle: 'Set up · Phase 10',
  intro: 'Choose how many people are playing and enter their names. Turns go in this order.',
  backLink: 'Rules',
  wordmark: 'Phase 10',
  countHeading: 'Number of players',
  namesHeading: 'Player names',
  orderNote: 'Play order follows this list. The player after the dealer goes first.',
  dealsFirst: 'Deals first',
  summary: (count: number, firstPlayer: string) =>
    `${count} players · ${firstPlayer} starts Round 1 on Phase 1`,
  startGame: 'Start game',
  placeholder: (seat: number) => `Player ${seat}`,
  nameLabel: (seat: number) => `Player ${seat} name`,
} as const;
