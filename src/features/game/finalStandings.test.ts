import { describe, expect, it } from 'vite-plus/test';

import { finalStandings } from './finalStandings';
import { goOut, makeGame, num, withPlayer } from './test/makeGame';

// Ana goes out on Phase 10; Ben and Cy are given the phase, laid-down flag and score passed in.
function finalRound(ben: object, cy: object) {
  const game = makeGame([num(5)]);
  const ana = withPlayer(game, 'Ana', { phase: 10, hasLaidDown: true, score: 50 });
  return goOut(withPlayer(withPlayer(ana, 'Ben', { hand: [num(1)], ...ben }), 'Cy', cy));
}

// Ana and Ben tie on 100 and replay Phase 10; Cy finished on more points or sat at Phase 9.
function tiebreakOver(cy: object) {
  const game = makeGame([num(5)]);
  const ana = withPlayer(game, 'Ana', { phase: 10, hasLaidDown: true, score: 100 });
  const ben = withPlayer(ana, 'Ben', { phase: 10, hasLaidDown: true, score: 95, hand: [num(1)] });
  const tie = goOut(withPlayer(ben, 'Cy', { hand: [num(2)], ...cy }));
  const tiebreak = { ...tie, view: 'turn' as const, currentPlayerIndex: 1 };
  return goOut(withPlayer(tiebreak, 'Ben', { hand: [num(9)], score: 150 }));
}

function rows(game: ReturnType<typeof finalRound>) {
  return finalStandings(game).standings.map((s) => [s.player.name, s.isWinner, s.hasFinished]);
}

describe('finalStandings', () => {
  it('names the only Phase 10 finisher and ranks the rest by phase, then points', () => {
    const game = finalRound({ phase: 6, score: 10 }, { phase: 6, score: 5, hand: [num(2)] });

    expect(finalStandings(game).reason).toBe('onlyFinisher');
    expect(rows(game)).toEqual([
      ['Ana', true, true],
      ['Cy', false, false],
      ['Ben', false, false],
    ]);
  });

  it('gives the lowest total the win when several players finish Phase 10', () => {
    const game = finalRound(
      { phase: 10, hasLaidDown: true, score: 0 },
      { phase: 9, score: 0, hand: [num(2)] }
    );
    const result = finalStandings(game);

    expect([result.winner.name, result.reason]).toEqual(['Ben', 'lowestTotal']);
    expect(rows(game)).toEqual([
      ['Ben', true, true],
      ['Ana', false, true],
      ['Cy', false, false],
    ]);
  });

  it('does not count a player who only reached Phase 10 in the last round', () => {
    const game = finalRound(
      { phase: 9, hasLaidDown: true, score: 0 },
      { phase: 9, score: 0, hand: [num(2)] }
    );

    expect(finalStandings(game).reason).toBe('onlyFinisher');
    expect(rows(game)).toEqual([
      ['Ana', true, true],
      ['Ben', false, false],
      ['Cy', false, false],
    ]);
  });

  it('ranks a finisher who sat out the tiebreak among the finishers, by total', () => {
    const result = finalStandings(tiebreakOver({ phase: 10, hasLaidDown: true, score: 100 }));

    expect([result.winner.name, result.reason]).toEqual(['Ben', 'tiebreak']);
    expect(result.standings.map((s) => [s.player.name, s.hasFinished])).toEqual([
      ['Ben', true],
      ['Ana', true],
      ['Cy', true],
    ]);
  });

  it('leaves a player who sat out without finishing below the finishers', () => {
    const result = finalStandings(tiebreakOver({ phase: 9, score: 0 }));

    expect(result.standings.map((s) => [s.player.name, s.hasFinished])).toEqual([
      ['Ben', true],
      ['Ana', true],
      ['Cy', false],
    ]);
  });
});
