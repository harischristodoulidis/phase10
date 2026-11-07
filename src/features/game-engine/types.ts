import type { CARD_COLORS, CARD_VALUES, SEAT_COLORS } from './constants';

export type CardColor = (typeof CARD_COLORS)[number];

export type CardValue = (typeof CARD_VALUES)[number];

export type SeatColor = (typeof SEAT_COLORS)[number];

export type Card =
  | { kind: 'number'; id: string; value: CardValue; color: CardColor }
  | { kind: 'wild'; id: string }
  | { kind: 'skip'; id: string };

export type NumberCard = Extract<Card, { kind: 'number' }>;

export type WildCard = Extract<Card, { kind: 'wild' }>;

export type PlayerCount = 2 | 3 | 4 | 5 | 6;

export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type GroupType = 'set' | 'run' | 'color';

export type GroupRequirement = { type: GroupType; size: number };

export type PhaseRequirement = {
  phase: PhaseNumber;
  groups: readonly GroupRequirement[];
  label: string;
};

/** A group laid on the table. Groups can grow through hits. */
export type Group = { id: string; type: GroupType; cards: Card[] };

export type Result<T> = { ok: true; value: T } | { ok: false; reason: string };

export type Player = {
  id: string;
  name: string;
  color: SeatColor;
  phase: PhaseNumber;
  score: number;
  hand: Card[];
  laidGroups: Group[];
  hasLaidDown: boolean;
  isSkipped: boolean;
  wasSkippedThisRound: boolean;
  isSittingOut: boolean;
};

export type TurnStep = 'draw' | 'play' | 'done';

export type GameView = 'handoff' | 'turn' | 'roundSummary' | 'gameOver';

export type GameState = {
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  dealerIndex: number;
  currentPlayerIndex: number;
  round: number;
  turnStep: TurnStep;
  view: GameView;
  lastAction: string | null;
  rngSeed: number;
  winnerId: string | null;
};
