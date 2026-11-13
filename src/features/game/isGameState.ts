import {
  PHASES,
  SEAT_COLORS,
  type GameState,
  type GameView,
  type TurnStep,
} from '@features/game-engine';

const VIEWS = [
  'handoff',
  'turn',
  'roundSummary',
  'gameOver',
] as const satisfies readonly GameView[];
const STEPS = ['draw', 'play', 'done'] as const satisfies readonly TurnStep[];
const CARD_KINDS = ['number', 'wild', 'skip'] as const;
const PLAYER_FLAGS = ['hasLaidDown', 'isSkipped', 'wasSkippedThisRound', 'isSittingOut'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function isOneOf(options: readonly unknown[], value: unknown): boolean {
  return options.includes(value);
}

function isIndex(value: unknown, length: number): boolean {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0 && value < length;
}

function isCardList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (card) => isRecord(card) && typeof card.id === 'string' && isOneOf(CARD_KINDS, card.kind)
    )
  );
}

function isPlayer(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    isOneOf(SEAT_COLORS, value.color) &&
    isOneOf(
      PHASES.map(({ phase }) => phase),
      value.phase
    ) &&
    typeof value.score === 'number' &&
    PLAYER_FLAGS.every((flag) => typeof value[flag] === 'boolean') &&
    isCardList(value.hand) &&
    Array.isArray(value.laidGroups) &&
    value.laidGroups.every(
      (group) => isRecord(group) && typeof group.id === 'string' && isCardList(group.cards)
    )
  );
}

function isAllPlayersTie(value: Record<string, unknown>, players: Record<string, unknown>[]) {
  return (
    value.view === 'roundSummary' &&
    players.every(
      (player) =>
        player.phase === 10 && player.hasLaidDown === true && player.score === players[0].score
    )
  );
}

// Old saves: a tiebreak shows as someone sitting out, or as everyone finishing level.
function guessTiebreak(value: Record<string, unknown>, players: Record<string, unknown>[]) {
  return players.some((player) => player.isSittingOut === true) || isAllPlayersTie(value, players);
}

// Best guess for old saves: a 9 → 10 lay-down in the last round can't be told from a finish.
function guessFinisherIds(players: Record<string, unknown>[], isTiebreak: unknown) {
  const isTied = (player: Record<string, unknown>) =>
    isTiebreak === true && player.isSittingOut !== true;
  return players
    .filter((player) => player.phase === 10 && (player.hasLaidDown === true || isTied(player)))
    .map((player) => player.id);
}

export function upgradeSavedGame(value: unknown): unknown {
  if (!isRecord(value) || !Array.isArray(value.players)) {
    return value;
  }
  if ('isTiebreak' in value && 'finisherIds' in value) {
    return value;
  }
  const players = value.players.filter(isRecord);
  const isTiebreak = 'isTiebreak' in value ? value.isTiebreak : guessTiebreak(value, players);
  const finisherIds =
    'finisherIds' in value ? value.finisherIds : guessFinisherIds(players, isTiebreak);
  return { ...value, isTiebreak, finisherIds };
}

// Saved data can come from an older version or be edited by hand, so check it deeply
// enough that rendering can't crash on it.
export function isGameState(value: unknown): value is GameState {
  if (!isRecord(value) || !Array.isArray(value.players)) {
    return false;
  }
  const { players } = value;
  return (
    players.length >= 2 &&
    players.every(isPlayer) &&
    isCardList(value.drawPile) &&
    isCardList(value.discardPile) &&
    isIndex(value.currentPlayerIndex, players.length) &&
    isIndex(value.dealerIndex, players.length) &&
    typeof value.round === 'number' &&
    typeof value.rngSeed === 'number' &&
    isOneOf(VIEWS, value.view) &&
    isOneOf(STEPS, value.turnStep) &&
    isNullableString(value.lastAction) &&
    isNullableString(value.winnerId) &&
    (value.view !== 'gameOver' || typeof value.winnerId === 'string') &&
    typeof value.isTiebreak === 'boolean' &&
    Array.isArray(value.finisherIds) &&
    value.finisherIds.every((id) => typeof id === 'string')
  );
}
