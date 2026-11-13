import { describe, expect, it } from 'vite-plus/test';

import { summarizeRound } from './roundSummary';
import { goOut, makeGame, num, skip, wild, withPlayer } from './test/makeGame';

// Ana goes out after laying down; Ben never laid down; Cy did.
function endedRound() {
  const game = makeGame([num(5)], { dealerIndex: 2 });
  const ana = withPlayer(game, 'Ana', { phase: 2, hasLaidDown: true });
  const ben = withPlayer(ana, 'Ben', { phase: 2, hand: [num(4), skip()] });
  return goOut(withPlayer(ben, 'Cy', { phase: 4, hasLaidDown: true, hand: [wild()] }));
}

// Ana and Ben both finish Phase 10 on 100; Cy is far behind.
function tiedRound(cyIsDone = false) {
  const game = makeGame([num(5)]);
  const ana = withPlayer(game, 'Ana', { phase: 10, hasLaidDown: true, score: 100 });
  const ben = withPlayer(ana, 'Ben', { phase: 10, hasLaidDown: true, score: 95, hand: [num(1)] });
  const cy = cyIsDone
    ? { phase: 10 as const, hasLaidDown: true, score: 95, hand: [num(2)] }
    : { phase: 4 as const, score: 10, hand: [num(2)] };
  return goOut(withPlayer(ben, 'Cy', cy));
}

describe('summarizeRound', () => {
  it('reads each player’s outcome and points for the round', () => {
    const { results, wentOut } = summarizeRound(endedRound());

    expect(wentOut.name).toBe('Ana');
    expect(results.map((r) => [r.player.name, r.wentOut, r.points, r.outcome])).toEqual([
      ['Ana', true, 0, { kind: 'advanced', from: 2, to: 3 }],
      ['Ben', false, 20, { kind: 'repeats', phase: 2 }],
      ['Cy', false, 25, { kind: 'advanced', from: 4, to: 5 }],
    ]);
  });

  it('passes the deal one seat left', () => {
    const { nextDealer, tiedPlayers } = summarizeRound(endedRound());

    expect(nextDealer.name).toBe('Ana');
    expect(tiedPlayers).toEqual([]);
  });

  it('marks the tied players and the ones who sit out the tiebreak', () => {
    const { results, tiedPlayers } = summarizeRound(tiedRound());

    expect(results.map((r) => r.outcome.kind)).toEqual(['tied', 'tied', 'sitsOut']);
    expect(tiedPlayers.map((p) => p.name)).toEqual(['Ana', 'Ben']);
  });

  it('announces a tie when every player is tied', () => {
    const { results, tiedPlayers } = summarizeRound(tiedRound(true));

    expect(results.map((r) => r.outcome.kind)).toEqual(['tied', 'tied', 'tied']);
    expect(tiedPlayers).toHaveLength(3);
  });
});
