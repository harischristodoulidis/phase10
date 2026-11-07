import { describe, expect, it } from 'vite-plus/test';

import { DECK_SIZE, HAND_SIZE, SEAT_COLORS } from './constants';
import { startGame, startNextRound } from './round';
import { skipTargets } from './skip';
import { group, makePlayer, makeState, num, nums, skip, unwrap, wild } from './testUtils';
import { discard } from './turn';
import type { Card, GameState } from './types';

const NAMES = ['Haris', 'Maria', 'Sam', 'Ana', 'Leo', 'Kim'];

function topIsSkip(state: GameState): boolean {
  return state.discardPile.at(-1)?.kind === 'skip';
}

function findGame(predicate: (state: GameState) => boolean): GameState {
  for (let seed = 1; seed < 5000; seed++) {
    const state = unwrap(startGame(NAMES.slice(0, 3), seed));
    if (predicate(state)) {
      return state;
    }
  }
  throw new Error('No seed found.');
}

function allCards(state: GameState): Card[] {
  return [...state.players.flatMap((p) => p.hand), ...state.drawPile, ...state.discardPile];
}

describe('startGame', () => {
  it.each([2, 3, 4, 5, 6])('deals a new game for %i players', (count) => {
    const state = unwrap(startGame(NAMES.slice(0, count), 7));

    expect(state.players.map((p) => [p.id, p.name, p.color, p.phase, p.score])).toEqual(
      NAMES.slice(0, count).map((name, i) => [`p${i + 1}`, name, SEAT_COLORS[i], 1, 0])
    );
    for (const player of state.players) {
      expect(player.hand).toHaveLength(HAND_SIZE);
    }
    expect(allCards(state)).toHaveLength(DECK_SIZE);
    expect(state.dealerIndex).toBe(count - 1);
    expect(state.currentPlayerIndex).toBe(topIsSkip(state) ? 1 : 0);
    expect([state.round, state.view, state.turnStep, state.winnerId]).toEqual([
      1,
      'handoff',
      'draw',
      null,
    ]);
  });

  it('rejects fewer than 2 or more than 6 players', () => {
    expect(startGame(['Haris'], 1)).toEqual({ ok: false, reason: 'Choose 2 to 6 players.' });
    expect(startGame([...NAMES, 'Zoe'], 1)).toEqual({
      ok: false,
      reason: 'Choose 2 to 6 players.',
    });
  });

  it('rejects a blank name and trims names', () => {
    expect(startGame(['Haris', '  '], 1)).toEqual({
      ok: false,
      reason: 'Every player needs a name.',
    });
    expect(unwrap(startGame([' Haris ', 'Maria'], 1)).players[0].name).toBe('Haris');
  });

  it('deals the same game for the same seed', () => {
    expect(unwrap(startGame(NAMES.slice(0, 3), 9))).toEqual(
      unwrap(startGame(NAMES.slice(0, 3), 9))
    );
    expect(unwrap(startGame(NAMES.slice(0, 3), 9))).not.toEqual(
      unwrap(startGame(NAMES.slice(0, 3), 10))
    );
  });

  it('skips the first player when the first card is a Skip, using up their skip', () => {
    const state = findGame(topIsSkip);

    expect(state.currentPlayerIndex).toBe(1);
    expect(state.players[0].wasSkippedThisRound).toBe(true);
    expect(state.lastAction).toBe("The first card is a Skip · Haris's turn was skipped");
    expect(skipTargets(state).map((p) => p.name)).toEqual(['Sam']);
  });

  it('starts normally when the first card is a Wild', () => {
    const state = findGame((s) => s.discardPile.at(-1)?.kind === 'wild');

    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players.some((p) => p.wasSkippedThisRound)).toBe(false);
  });
});

describe('ending a round', () => {
  function goOut(players: GameState['players']): GameState {
    const state = makeState({ players });
    return unwrap(discard(state, players[0].hand[0].id));
  }

  it('scores the cards left in hand and advances players who laid down', () => {
    const next = goOut([
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, score: 20 }),
      makePlayer('Maria', {
        hand: [...nums(1, 9, 10, 12), skip(), wild()],
        laidGroups: [group('set', nums(4, 4, 4))],
        hasLaidDown: true,
        phase: 3,
      }),
      makePlayer('Sam', { hand: [num(2)], phase: 2, score: 10 }),
    ]);

    expect(next.players.map((p) => [p.score, p.phase])).toEqual([
      [20, 2],
      [70, 4],
      [15, 2],
    ]);
    expect([next.view, next.turnStep, next.lastAction]).toEqual([
      'roundSummary',
      'done',
      'Haris went out',
    ]);
  });

  it('moves a player from Phase 9 to Phase 10 without ending the game', () => {
    const next = goOut([
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 9 }),
      makePlayer('Maria'),
    ]);

    expect(next.players[0].phase).toBe(10);
    expect([next.view, next.winnerId]).toEqual(['roundSummary', null]);
  });

  it('ends the game when a Phase 10 player completes it, even if someone else goes out', () => {
    const next = goOut([
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 5 }),
      makePlayer('Maria', { hand: [num(2)], hasLaidDown: true, phase: 10 }),
    ]);

    expect([next.view, next.winnerId]).toEqual(['gameOver', 'Maria']);
  });

  it('ends the game when one player completes Phase 10', () => {
    const next = goOut([
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 10, score: 80 }),
      makePlayer('Maria', { phase: 9, hasLaidDown: true }),
    ]);

    expect([next.view, next.winnerId, next.players[0].phase]).toEqual(['gameOver', 'Haris', 10]);
  });

  it('gives the win to the lower total when two players complete Phase 10', () => {
    const next = goOut([
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 10, score: 100 }),
      makePlayer('Maria', { hand: [num(1)], hasLaidDown: true, phase: 10, score: 40 }),
    ]);

    expect([next.view, next.winnerId]).toEqual(['gameOver', 'Maria']);
  });
});

describe('Phase 10 tiebreak', () => {
  function tiedGame(): GameState {
    const players = [
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 10, score: 100 }),
      makePlayer('Maria', { hand: [num(1)], hasLaidDown: true, phase: 10, score: 95 }),
      makePlayer('Sam', { hand: [num(2)], phase: 4, score: 10 }),
    ];
    return unwrap(discard(makeState({ players, rngSeed: 3 }), players[0].hand[0].id));
  }

  it('sits out everyone but the tied players when the lowest totals tie', () => {
    const state = tiedGame();

    expect(state.players.map((p) => p.score)).toEqual([100, 100, 15]);
    expect(state.players.map((p) => p.isSittingOut)).toEqual([false, false, true]);
    expect([state.view, state.winnerId]).toEqual(['roundSummary', null]);
  });

  it('deals the tiebreak round only to the tied players', () => {
    const state = unwrap(startNextRound(tiedGame()));

    expect(state.players.map((p) => p.hand.length)).toEqual([HAND_SIZE, HAND_SIZE, 0]);
    expect(state.players.map((p) => p.phase)).toEqual([10, 10, 4]);
    expect(state.players[state.currentPlayerIndex].isSittingOut).toBe(false);
    expect(allCards(state)).toHaveLength(DECK_SIZE);
  });

  it('never gives a turn to, or lets anyone skip, a player who sits out', () => {
    const tiebreak = unwrap(startNextRound(tiedGame()));
    const playing = { ...tiebreak, view: 'turn' as const, turnStep: 'play' as const };
    const current = playing.players[playing.currentPlayerIndex];
    const card = current.hand.find((c) => c.kind !== 'skip');
    if (card === undefined) {
      throw new Error('Hand has only Skips.');
    }
    const next = unwrap(discard(playing, card.id));

    expect(skipTargets(playing).map((p) => p.name)).not.toContain('Sam');
    expect(next.players[next.currentPlayerIndex].name).not.toBe('Sam');
    expect(next.currentPlayerIndex).not.toBe(playing.currentPlayerIndex);
  });

  it('gives the win to the first tied player to go out, whatever the scores', () => {
    const players = [
      makePlayer('Haris', { hand: [num(5)], phase: 10, score: 100 }),
      makePlayer('Maria', { hand: nums(1, 2), phase: 10, score: 100 }),
      makePlayer('Sam', { phase: 4, score: 10, isSittingOut: true }),
    ];
    const next = unwrap(discard(makeState({ players }), players[0].hand[0].id));

    expect([next.view, next.winnerId]).toEqual(['gameOver', 'Haris']);
    expect(next.players[2].score).toBe(10);
  });
  it('scores the tied players as usual in the tiebreak round', () => {
    const players = [
      makePlayer('Haris', { hand: [num(5)], phase: 10, score: 100 }),
      makePlayer('Maria', { hand: nums(1, 2), phase: 10, score: 100 }),
      makePlayer('Sam', { phase: 4, score: 10, isSittingOut: true }),
    ];
    const next = unwrap(discard(makeState({ players }), players[0].hand[0].id));

    expect(next.players.map((p) => p.score)).toEqual([100, 110, 10]);
  });

  it('starts with the first tied player left of the dealer, even if the dealer sits out', () => {
    const fromHaris = unwrap(startNextRound(tiedGame()));
    const fromSam = unwrap(startNextRound({ ...tiedGame(), dealerIndex: 1 }));

    expect(fromHaris.dealerIndex).toBe(0);
    expect(fromHaris.currentPlayerIndex).toBe(topIsSkip(fromHaris) ? 0 : 1);
    expect(fromSam.dealerIndex).toBe(2);
    expect(fromSam.currentPlayerIndex).toBe(topIsSkip(fromSam) ? 1 : 0);
  });

  it('passes a starting Skip to the other tied player, not to one who sits out', () => {
    let state: GameState | null = null;
    for (let seed = 1; seed < 5000 && state === null; seed++) {
      const next = unwrap(startNextRound({ ...tiedGame(), rngSeed: seed }));
      state = topIsSkip(next) ? next : null;
    }
    if (state === null) {
      throw new Error('No seed found.');
    }

    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[1].wasSkippedThisRound).toBe(true);
    expect(skipTargets(state)).toEqual([]);
  });

  it('plays a tiebreak with everyone when every player is tied', () => {
    const players = [
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 10, score: 100 }),
      makePlayer('Maria', { hand: [num(1)], hasLaidDown: true, phase: 10, score: 95 }),
    ];
    const tie = unwrap(discard(makeState({ players }), players[0].hand[0].id));
    expect([tie.view, tie.players.some((p) => p.isSittingOut)]).toEqual(['roundSummary', false]);

    const round = unwrap(startNextRound(tie));
    const current = round.players[round.currentPlayerIndex];
    const last = current.hand[0];
    const playing: GameState = {
      ...round,
      view: 'turn',
      turnStep: 'play',
      players: round.players.map((p) =>
        p.id === current.id ? { ...p, hand: [last], hasLaidDown: true } : p
      ),
    };
    const next = unwrap(
      discard(playing, last.id, round.players.find((p) => p.id !== current.id)?.id)
    );

    expect([next.view, next.winnerId]).toEqual(['gameOver', current.id]);
  });

  it('sits out a Phase 10 finisher whose total is higher than the tie', () => {
    const players = [
      makePlayer('Haris', { hand: [num(5)], hasLaidDown: true, phase: 10, score: 100 }),
      makePlayer('Maria', { hand: [num(1)], hasLaidDown: true, phase: 10, score: 95 }),
      makePlayer('Sam', { hand: [wild()], hasLaidDown: true, phase: 10, score: 90 }),
    ];
    const next = unwrap(discard(makeState({ players }), players[0].hand[0].id));

    expect(next.players.map((p) => [p.score, p.isSittingOut])).toEqual([
      [100, false],
      [100, false],
      [115, true],
    ]);
  });

  it("can't skip a player who sits out", () => {
    const s = skip();
    const players = [
      makePlayer('Haris', { hand: [s, num(1)] }),
      makePlayer('Maria'),
      makePlayer('Sam', { isSittingOut: true }),
    ];

    expect(discard(makeState({ players }), s.id, 'Sam')).toEqual({
      ok: false,
      reason: "Sam isn't playing this round.",
    });
  });
});

describe('startNextRound', () => {
  const summary = makeState({
    view: 'roundSummary',
    turnStep: 'done',
    dealerIndex: 2,
    round: 1,
    players: [
      makePlayer('Haris', {
        score: 20,
        phase: 2,
        hasLaidDown: true,
        laidGroups: [group('set', nums(4, 4, 4))],
      }),
      makePlayer('Maria', { score: 70, phase: 3, hand: nums(1, 2), isSkipped: true }),
      makePlayer('Sam', { score: 15, phase: 2, wasSkippedThisRound: true }),
    ],
  });

  it('moves the dealer one seat left and deals a fresh round', () => {
    const state = unwrap(startNextRound(summary));

    expect([state.round, state.dealerIndex]).toEqual([2, 0]);
    expect(state.currentPlayerIndex).toBe(topIsSkip(state) ? 2 : 1);
    expect(state.players.map((p) => [p.score, p.phase, p.hand.length])).toEqual([
      [20, 2, HAND_SIZE],
      [70, 3, HAND_SIZE],
      [15, 2, HAND_SIZE],
    ]);
    expect(state.players.some((p) => p.laidGroups.length > 0 || p.hasLaidDown || p.isSkipped)).toBe(
      false
    );
    expect(state.players.filter((p) => p.wasSkippedThisRound)).toHaveLength(
      topIsSkip(state) ? 1 : 0
    );
    expect([state.view, state.turnStep]).toEqual(['handoff', 'draw']);
  });

  it('is only allowed from the round summary', () => {
    expect(startNextRound({ ...summary, view: 'gameOver' }).ok).toBe(false);
    expect(startNextRound({ ...summary, view: 'turn' })).toEqual({
      ok: false,
      reason: 'The round is still being played.',
    });
  });
});
