import {
  currentPlayer,
  discard,
  startGame,
  type Card,
  type CardColor,
  type CardValue,
  type GameState,
  type Group,
  type Player,
} from '@features/game-engine';

let nextId = 0;

export function num(value: CardValue, color: CardColor = 'red'): Card {
  nextId++;
  return { kind: 'number', id: `t${nextId}`, value, color };
}

export function wild(): Card {
  nextId++;
  return { kind: 'wild', id: `w${nextId}` };
}

export function skip(): Card {
  nextId++;
  return { kind: 'skip', id: `s${nextId}` };
}

export function setOf(value: CardValue, id: string): Group {
  return { id, type: 'set', cards: [num(value), num(value, 'green'), num(value, 'yellow')] };
}

// A three-player game on Ana's turn, with her hand and any state fields replaced.
export function makeGame(hand: Card[], overrides: Partial<GameState> = {}): GameState {
  const started = startGame(['Ana', 'Ben', 'Cy'], 1);
  if (!started.ok) {
    throw new Error(started.reason);
  }
  const game: GameState = {
    ...started.value,
    currentPlayerIndex: 0,
    view: 'turn',
    turnStep: 'draw',
    discardPile: [num(7, 'blue')],
    lastAction: null,
    ...overrides,
  };
  return {
    ...game,
    players: game.players.map((player, i) => ({
      ...player,
      hand: i === game.currentPlayerIndex ? hand : player.hand,
      wasSkippedThisRound: false,
    })),
  };
}

// Ends the round the way play does: the current player discards their last card.
export function goOut(game: GameState): GameState {
  const [last] = currentPlayer(game).hand;
  const result = last === undefined ? null : discard({ ...game, turnStep: 'play' }, last.id);
  if (result === null || !result.ok || result.value.view === 'turn') {
    throw new Error('The current player must hold exactly one card to go out.');
  }
  return result.value;
}

export function withPlayer(game: GameState, name: string, patch: Partial<Player>): GameState {
  return { ...game, players: game.players.map((p) => (p.name === name ? { ...p, ...patch } : p)) };
}
