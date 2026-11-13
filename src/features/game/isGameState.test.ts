import { describe, expect, it } from 'vite-plus/test';

import { isGameState, upgradeSavedGame } from './isGameState';
import { makeGame, num } from './test/makeGame';

function withFirstPlayer(patch: object) {
  const game = makeGame([]);
  return { ...game, players: game.players.map((p, i) => (i === 0 ? { ...p, ...patch } : p)) };
}

describe('isGameState', () => {
  it('accepts a game that survives a JSON round trip', () => {
    const game = makeGame([num(3)]);

    expect(isGameState(JSON.parse(JSON.stringify(game)))).toBe(true);
  });

  it.each([
    ['null', null],
    ['a number', 42],
    ['no players', { ...makeGame([]), players: [] }],
    ['an unknown view', { ...makeGame([]), view: 'lobby' }],
    ['an unknown step', { ...makeGame([]), turnStep: 'nap' }],
    ['a current index out of range', { ...makeGame([]), currentPlayerIndex: 9 }],
    ['a player without a hand', { ...makeGame([]), players: [{ id: 'p1', name: 'A' }] }],
    ['a phase out of range', withFirstPlayer({ phase: 11 })],
    ['a player missing a flag', withFirstPlayer({ hasLaidDown: undefined })],
    ['an unknown seat color', withFirstPlayer({ color: 'pink' })],
    ['a malformed card', withFirstPlayer({ hand: [{ id: 'x', kind: 'joker' }] })],
    ['a malformed draw pile', { ...makeGame([]), drawPile: [42] }],
    ['a missing tiebreak flag', { ...makeGame([]), isTiebreak: undefined }],
    ['malformed finisher ids', { ...makeGame([]), finisherIds: [7] }],
    ['a finished game without a winner', { ...makeGame([]), view: 'gameOver', winnerId: null }],
  ])('rejects %s', (_, value) => {
    expect(isGameState(value)).toBe(false);
  });
});

describe('upgradeSavedGame', () => {
  function oldSave(patch: object, view = 'turn') {
    const { isTiebreak: _, finisherIds: __, ...game } = { ...withFirstPlayer(patch), view };
    return JSON.parse(JSON.stringify(game));
  }

  it('guesses the Phase 10 finishers from players on Phase 10 who laid down', () => {
    const finished = { phase: 10, hasLaidDown: true };

    expect(upgradeSavedGame(oldSave(finished))).toMatchObject({ finisherIds: ['p1'] });
    expect(upgradeSavedGame(oldSave({ phase: 10 }))).toMatchObject({ finisherIds: [] });
  });

  it('fills in the tiebreak flag from players sitting out', () => {
    expect(upgradeSavedGame(oldSave({ isSittingOut: true }))).toMatchObject({ isTiebreak: true });
    expect(upgradeSavedGame(oldSave({}))).toMatchObject({ isTiebreak: false });
    expect(isGameState(upgradeSavedGame(oldSave({})))).toBe(true);
  });

  it('spots an all-players tie waiting on the round summary', () => {
    const finished = { phase: 10, hasLaidDown: true };

    expect(upgradeSavedGame(oldSave(finished, 'roundSummary'))).toMatchObject({ isTiebreak: true });
    expect(upgradeSavedGame(oldSave(finished, 'turn'))).toMatchObject({ isTiebreak: false });
  });

  it('leaves current saves and junk alone', () => {
    const game = { ...makeGame([]), isTiebreak: true, finisherIds: ['p2'] };

    expect(upgradeSavedGame(game)).toBe(game);
    expect(upgradeSavedGame(42)).toBe(42);
  });
});
