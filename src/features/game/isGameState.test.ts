import { describe, expect, it } from 'vite-plus/test';

import { isGameState } from './isGameState';
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
  ])('rejects %s', (_, value) => {
    expect(isGameState(value)).toBe(false);
  });
});
