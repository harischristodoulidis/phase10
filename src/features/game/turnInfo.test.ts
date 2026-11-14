import { describe, expect, it } from 'vite-plus/test';

import type { GameState } from '@features/game-engine';

import { makeGame } from './test/makeGame';
import { dealerOf, nextPlayerId, opponentsOf } from './turnInfo';

function withPlayer(game: GameState, name: string, patch: object): GameState {
  return { ...game, players: game.players.map((p) => (p.name === name ? { ...p, ...patch } : p)) };
}

describe('turn info', () => {
  it('finds the dealer and the other players', () => {
    const game = makeGame([]);

    expect(dealerOf(game).name).toBe('Cy');
    expect(opponentsOf(game).map((p) => p.name)).toEqual(['Ben', 'Cy']);
  });

  it('leaves players who sit out off the opponent list', () => {
    const game = withPlayer(makeGame([]), 'Ben', { isSittingOut: true });

    expect(opponentsOf(game).map((p) => p.name)).toEqual(['Cy']);
  });

  it('names the next player in turn order', () => {
    expect(nextPlayerId(makeGame([]))).toBe('p2');
  });

  it('passes over a skipped player', () => {
    expect(nextPlayerId(withPlayer(makeGame([]), 'Ben', { isSkipped: true }))).toBe('p3');
  });

  it('passes over a player sitting out', () => {
    expect(nextPlayerId(withPlayer(makeGame([]), 'Ben', { isSittingOut: true }))).toBe('p3');
  });

  it('passes over the target of a Skip not yet played', () => {
    expect(nextPlayerId(makeGame([]), 'p2')).toBe('p3');
  });

  it('comes back to the current player when everyone else is skipped', () => {
    const game = withPlayer(withPlayer(makeGame([]), 'Ben', { isSkipped: true }), 'Cy', {
      isSkipped: true,
    });

    expect(nextPlayerId(game)).toBe('p1');
  });
});
