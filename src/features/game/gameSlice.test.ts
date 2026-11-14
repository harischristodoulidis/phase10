import { describe, expect, it } from 'vite-plus/test';

import { currentPlayer, startGame, type GameState, type Group } from '@features/game-engine';

import {
  cardDiscarded,
  cardDrawn,
  cardHit,
  gameReducer,
  gameReset,
  gameStarted,
  handArranged,
  handRevealed,
  nextRoundStarted,
  phaseLaidDown,
} from './gameSlice';
import { makeGame, num, skip, wild } from './test/makeGame';

const setOfFours = (): Group => ({ id: 'g1', type: 'set', cards: [num(4), num(4), num(4)] });

function withLaidGroup(game: GameState, group: Group): GameState {
  return {
    ...game,
    players: game.players.map((p, i) =>
      i === game.currentPlayerIndex ? { ...p, hasLaidDown: true, laidGroups: [group] } : p
    ),
  };
}

describe('gameSlice', () => {
  it('starts with no game', () => {
    expect(gameReducer(undefined, { type: 'unknown' })).toBeNull();
  });

  it('starts a game from the names and the prepared seed', () => {
    const action = gameStarted(['Ana', 'Ben']);
    const expected = startGame(['Ana', 'Ben'], action.payload.seed);

    expect(typeof action.payload.seed).toBe('number');
    expect(expected.ok && gameReducer(null, action)).toEqual(expected.ok && expected.value);
  });

  it('ignores a start the engine rejects', () => {
    expect(gameReducer(null, gameStarted(['Solo']))).toBeNull();
  });

  it('reveals the hand on handoff', () => {
    const game = makeGame([num(1)], { view: 'handoff' });

    expect(gameReducer(game, handRevealed())?.view).toBe('turn');
  });

  it('arranges the hand and ignores an order that isn’t the whole hand', () => {
    const hand = [num(1), num(2), num(3)];
    const game = makeGame(hand);
    const next = gameReducer(game, handArranged([hand[2].id, hand[0].id, hand[1].id]));

    expect(next && currentPlayer(next).hand).toEqual([hand[2], hand[0], hand[1]]);
    expect(gameReducer(game, handArranged([hand[0].id]))).toBe(game);
    const hidden = makeGame(hand, { view: 'handoff' });
    expect(gameReducer(hidden, handArranged([hand[2].id, hand[0].id, hand[1].id]))).toBe(hidden);
  });

  it('draws a card', () => {
    const game = makeGame([num(1)]);
    const next = gameReducer(game, cardDrawn('discard'));

    expect(next?.turnStep).toBe('play');
    expect(next && currentPlayer(next).hand).toHaveLength(2);
  });

  it('leaves the state unchanged when a move fails', () => {
    const game = makeGame([num(1)]);

    expect(gameReducer(game, phaseLaidDown(['missing']))).toBe(game);
    expect(gameReducer(game, cardHit({ cardId: 'missing', groupId: 'g' }))).toBe(game);
    expect(gameReducer(game, nextRoundStarted())).toBe(game);
  });

  it('lays down a valid phase', () => {
    const hand = [num(4), num(4), num(4), num(9), num(9), wild(), num(1)];
    const game = makeGame(hand, { turnStep: 'play' });
    const ids = hand.slice(0, 6).map((card) => card.id);
    const next = gameReducer(game, phaseLaidDown(ids));

    expect(next && currentPlayer(next).hasLaidDown).toBe(true);
  });

  it('discards and hands over to the next player', () => {
    const hand = [num(1), num(2)];
    const next = gameReducer(
      makeGame(hand, { turnStep: 'play' }),
      cardDiscarded({ cardId: hand[0].id })
    );

    expect(next?.view).toBe('handoff');
    expect(next?.currentPlayerIndex).toBe(1);
  });

  it('won’t take a Skip from the discard pile', () => {
    const game = makeGame([num(1)], { discardPile: [skip()] });

    expect(gameReducer(game, cardDrawn('discard'))).toBe(game);
  });

  it('won’t lay down a second phase in a round', () => {
    const hand = [num(4), num(4), num(4), num(9), num(9), num(9), num(1)];
    const game = withLaidGroup(makeGame(hand, { turnStep: 'play' }), setOfFours());

    expect(gameReducer(game, phaseLaidDown(hand.slice(0, 6).map((c) => c.id)))).toBe(game);
  });

  it('hits a laid-down group', () => {
    const extra = num(4, 'blue');
    const game = withLaidGroup(makeGame([extra, num(1)], { turnStep: 'play' }), setOfFours());
    const next = gameReducer(game, cardHit({ cardId: extra.id, groupId: 'g1' }));

    expect(next && currentPlayer(next).laidGroups[0]?.cards).toHaveLength(4);
  });

  it('plays a Skip against the chosen player and needs a target', () => {
    const card = skip();
    const game = makeGame([card, num(2)], { turnStep: 'play' });
    const next = gameReducer(game, cardDiscarded({ cardId: card.id, skipTargetId: 'p2' }));

    expect(next?.players[1]?.wasSkippedThisRound).toBe(true);
    expect(next?.currentPlayerIndex).toBe(2);
    expect(gameReducer(game, cardDiscarded({ cardId: card.id }))).toBe(game);
  });

  it('starts the next round from the round summary', () => {
    const next = gameReducer(
      makeGame([], { view: 'roundSummary', turnStep: 'done' }),
      nextRoundStarted()
    );

    expect(next?.round).toBe(2);
    expect(next?.view).toBe('handoff');
  });

  it('does nothing without a game', () => {
    expect(gameReducer(null, cardDrawn('deck'))).toBeNull();
  });

  it('resets the game', () => {
    expect(gameReducer(makeGame([]), gameReset())).toBeNull();
  });
});
