import { describe, expect, it } from 'vite-plus/test';

import type { GameView, Player } from '@features/game-engine';

import { isGameState, upgradeSavedGame } from './isGameState';
import { makeGame, num } from './test/makeGame';

function withPlayers(...patches: Partial<Player>[]) {
  const game = makeGame([]);
  return { ...game, players: game.players.map((p, i) => ({ ...p, ...patches[i] })) };
}

// Saved data can hold anything, so invalid cases patch the first player with loose values.
function withBadPlayer(patch: Record<string, unknown>) {
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
    ['a phase out of range', withBadPlayer({ phase: 11 })],
    ['a player missing a flag', withBadPlayer({ hasLaidDown: undefined })],
    ['an unknown seat color', withBadPlayer({ color: 'pink' })],
    ['a malformed card', withBadPlayer({ hand: [{ id: 'x', kind: 'joker' }] })],
    ['a malformed draw pile', { ...makeGame([]), drawPile: [42] }],
    ['a missing tiebreak flag', { ...makeGame([]), isTiebreak: undefined }],
    ['malformed finisher ids', { ...makeGame([]), finisherIds: [7] }],
    ['a finished game without a winner', { ...makeGame([]), view: 'gameOver', winnerId: null }],
  ])('rejects %s', (_, value) => {
    expect(isGameState(value)).toBe(false);
  });
});

describe('upgradeSavedGame', () => {
  const finished = { phase: 10, hasLaidDown: true, score: 50 } as const;

  function oldSave(patches: Partial<Player>[], view: GameView = 'turn') {
    const { isTiebreak: _, finisherIds: __, ...game } = { ...withPlayers(...patches), view };
    return JSON.parse(JSON.stringify(game));
  }

  it('guesses the Phase 10 finishers from players on Phase 10 who laid down', () => {
    expect(upgradeSavedGame(oldSave([finished]))).toMatchObject({ finisherIds: ['p1'] });
    expect(upgradeSavedGame(oldSave([{ phase: 10 }]))).toMatchObject({ finisherIds: [] });
  });

  it('fills in the tiebreak flag from players sitting out', () => {
    expect(upgradeSavedGame(oldSave([{ isSittingOut: true }]))).toMatchObject({
      isTiebreak: true,
    });
    expect(upgradeSavedGame(oldSave([]))).toMatchObject({ isTiebreak: false });
    expect(isGameState(upgradeSavedGame(oldSave([])))).toBe(true);
  });

  it('spots an all-players tie waiting on the round summary', () => {
    const tie = [finished, finished, finished];

    expect(upgradeSavedGame(oldSave(tie, 'roundSummary'))).toMatchObject({
      isTiebreak: true,
      finisherIds: ['p1', 'p2', 'p3'],
    });
    expect(upgradeSavedGame(oldSave(tie, 'turn'))).toMatchObject({ isTiebreak: false });
  });

  it('does not mistake a Phase 9 lay-down for a tie', () => {
    const save = oldSave([finished, { phase: 4 }, { phase: 4 }], 'roundSummary');

    expect(upgradeSavedGame(save)).toMatchObject({ isTiebreak: false });
  });

  it('counts only the tied players as finishers at the end of a tiebreak', () => {
    const tied = { phase: 10, score: 50 } as const;
    const save = oldSave([tied, tied, { phase: 10, isSittingOut: true }], 'gameOver');

    expect(upgradeSavedGame({ ...save, winnerId: 'p1' })).toMatchObject({
      isTiebreak: true,
      finisherIds: ['p1', 'p2'],
    });
  });

  it('leaves current saves and junk alone', () => {
    const game = { ...makeGame([]), isTiebreak: true, finisherIds: ['p2'] };

    expect(upgradeSavedGame(game)).toBe(game);
    expect(upgradeSavedGame(42)).toBe(42);
  });
});
