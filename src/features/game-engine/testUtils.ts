import type { Card, CardColor, CardValue, GameState, Group, Player, Result } from './types';

let nextId = 0;

export function num(value: CardValue, color: CardColor = 'red'): Card {
  nextId++;
  return { kind: 'number', id: `n${nextId}`, value, color };
}

export function nums(...values: CardValue[]): Card[] {
  return values.map((value) => num(value));
}

export function wild(): Card {
  nextId++;
  return { kind: 'wild', id: `w${nextId}` };
}

export function skip(): Card {
  nextId++;
  return { kind: 'skip', id: `s${nextId}` };
}

export function group(type: Group['type'], cards: Card[], id = 'g'): Group {
  return { id, type, cards };
}

export function makePlayer(name: string, overrides: Partial<Player> = {}): Player {
  return {
    id: name,
    name,
    color: 'red',
    phase: 1,
    score: 0,
    hand: [],
    laidGroups: [],
    hasLaidDown: false,
    isSkipped: false,
    wasSkippedThisRound: false,
    isSittingOut: false,
    ...overrides,
  };
}

export function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [makePlayer('Haris'), makePlayer('Maria'), makePlayer('Sam')],
    drawPile: [],
    discardPile: [],
    dealerIndex: 2,
    currentPlayerIndex: 0,
    round: 1,
    turnStep: 'play',
    view: 'turn',
    lastAction: null,
    rngSeed: 42,
    winnerId: null,
    isTiebreak: false,
    finisherIds: [],
    ...overrides,
  };
}

export function ids(cards: readonly Card[]): string[] {
  return cards.map((card) => card.id);
}

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(result.reason);
  }
  return result.value;
}
