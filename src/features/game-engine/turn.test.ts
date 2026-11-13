import { describe, expect, it } from 'vite-plus/test';

import { draw } from './draw';
import { skipTargets } from './skip';
import { group, ids, makePlayer, makeState, num, nums, skip, unwrap, wild } from './testUtils';
import { discard, hit, layDown, revealHand } from './turn';

describe('revealHand', () => {
  it('shows the cards after the handoff', () => {
    expect(unwrap(revealHand(makeState({ view: 'handoff' }))).view).toBe('turn');
    expect(revealHand(makeState())).toEqual({
      ok: false,
      reason: 'The cards are already showing.',
    });
    expect(revealHand(makeState({ view: 'roundSummary', turnStep: 'done' }))).toEqual({
      ok: false,
      reason: 'The round is over.',
    });
  });
});

describe('layDown', () => {
  const phaseCards = nums(3, 3, 3, 9, 9, 9);
  const extra = num(3);
  const state = makeState({
    players: [makePlayer('Haris', { hand: [...phaseCards, extra] }), makePlayer('Maria')],
  });

  it('moves a valid phase from the hand to the table', () => {
    const player = unwrap(layDown(state, ids(phaseCards))).players[0];

    expect(player.hand).toEqual([extra]);
    expect(player.hasLaidDown).toBe(true);
    expect(player.laidGroups.map((g) => [g.id, g.type, g.cards.length])).toEqual([
      ['Haris-g1', 'set', 3],
      ['Haris-g2', 'set', 3],
    ]);
  });

  it('rejects cards that do not make the phase', () => {
    expect(layDown(state, ids([...phaseCards.slice(0, 5), extra]))).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make 2 sets of 3.",
    });
  });

  it('allows only one lay down per round', () => {
    const next = unwrap(layDown(state, ids(phaseCards)));

    expect(layDown(next, ids(phaseCards)).ok).toBe(false);
  });

  it('rejects cards that are not in the hand, and laying down before drawing', () => {
    expect(layDown(state, ['nope', ...ids(phaseCards.slice(1))]).ok).toBe(false);
    expect(layDown({ ...state, turnStep: 'draw' }, ids(phaseCards))).toEqual({
      ok: false,
      reason: 'Draw a card first.',
    });
  });

  it('allows a hit on the same turn as laying down', () => {
    const laid = unwrap(layDown(state, ids(phaseCards)));
    const threes = laid.players[0].laidGroups.find((g) =>
      g.cards.some((c) => c.id === phaseCards[0].id)
    );
    const next = unwrap(hit(laid, extra.id, threes?.id ?? ''));

    expect(next.players[0].hand).toEqual([]);
    expect(next.players[0].laidGroups.find((g) => g.id === threes?.id)?.cards).toHaveLength(4);
  });
});

describe('hit', () => {
  const mariaSet = group('set', nums(7, 7, 7), 'Maria-g1');
  const [seven, two] = nums(7, 2);
  const state = makeState({
    players: [
      makePlayer('Haris', { hand: [seven, two], hasLaidDown: true }),
      makePlayer('Maria', { laidGroups: [mariaSet], hasLaidDown: true }),
    ],
  });

  it("adds a card to another player's group", () => {
    const next = unwrap(hit(state, seven.id, 'Maria-g1'));

    expect(next.players[0].hand).toEqual([two]);
    expect(next.players[1].laidGroups[0].cards).toEqual([...mariaSet.cards, seven]);
  });

  it('needs your own phase down first', () => {
    const notDown = {
      ...state,
      players: [{ ...state.players[0], hasLaidDown: false }, state.players[1]],
    };

    expect(hit(notDown, seven.id, 'Maria-g1')).toEqual({
      ok: false,
      reason: 'Lay down your phase before hitting.',
    });
  });

  it('rejects a card that does not fit, a Skip, and a missing group', () => {
    const s = skip();
    const withSkip = {
      ...state,
      players: [{ ...state.players[0], hand: [s, two] }, state.players[1]],
    };

    expect(hit(state, two.id, 'Maria-g1').ok).toBe(false);
    expect(hit(withSkip, s.id, 'Maria-g1')).toEqual({
      ok: false,
      reason: "A Skip can't be used as a hit.",
    });
    expect(hit(state, seven.id, 'nope').ok).toBe(false);
  });

  it('ends the round when the last card is hit', () => {
    const last = { ...state, players: [{ ...state.players[0], hand: [seven] }, state.players[1]] };
    const next = unwrap(hit(last, seven.id, 'Maria-g1'));

    expect(next.players[0].hand).toEqual([]);
    expect(next.view).toBe('roundSummary');
    expect(next.turnStep).toBe('done');
    expect(next.lastAction).toBe('Haris went out');
  });

  it('wins the tiebreak when the last card is hit', () => {
    const tiebreak = {
      ...state,
      isTiebreak: true,
      players: [
        { ...state.players[0], phase: 10 as const, hand: [seven] },
        { ...state.players[1], phase: 10 as const },
      ],
    };
    const next = unwrap(hit(tiebreak, seven.id, 'Maria-g1'));

    expect(next.view).toBe('gameOver');
    expect(next.winnerId).toBe(state.players[0].id);
  });
});

describe('discard', () => {
  const [five, eight] = [num(5, 'green'), num(8)];
  const s = skip();
  const base = makeState({
    players: [
      makePlayer('Haris', { hand: [five, eight, s] }),
      makePlayer('Maria', { hand: nums(1, 2) }),
      makePlayer('Sam', { hand: nums(3, 4) }),
    ],
  });

  it('ends the turn and passes to the next player', () => {
    const next = unwrap(discard(base, five.id));

    expect(next.discardPile.at(-1)).toBe(five);
    expect(next.players[0].hand).toEqual([eight, s]);
    expect(next.currentPlayerIndex).toBe(1);
    expect(next.turnStep).toBe('draw');
    expect(next.view).toBe('handoff');
    expect(next.lastAction).toBe('Haris discarded a green 5');
  });

  it('wraps from the last player to the first', () => {
    const last = { ...base, currentPlayerIndex: 2 };

    expect(unwrap(discard(last, last.players[2].hand[0].id)).currentPlayerIndex).toBe(0);
  });

  it('needs a target for a Skip, and not yourself', () => {
    expect(discard(base, s.id)).toEqual({ ok: false, reason: 'Choose a player to skip.' });
    expect(discard(base, s.id, 'Haris')).toEqual({ ok: false, reason: "You can't skip yourself." });
  });

  it('passes over a skipped next player and clears their skip', () => {
    const next = unwrap(discard(base, s.id, 'Maria'));

    expect(next.currentPlayerIndex).toBe(2);
    expect(next.players[1].isSkipped).toBe(false);
    expect(next.players[1].wasSkippedThisRound).toBe(true);
    expect(next.lastAction).toBe("Haris skipped Maria · Maria's turn was skipped");
  });

  it('keeps a skip until that player would play', () => {
    const afterHaris = unwrap(discard(base, s.id, 'Sam'));
    expect(afterHaris.currentPlayerIndex).toBe(1);
    expect(afterHaris.players[2].isSkipped).toBe(true);

    const mariaTurn = { ...afterHaris, view: 'turn' as const, turnStep: 'play' as const };
    const afterMaria = unwrap(discard(mariaTurn, mariaTurn.players[1].hand[0].id));
    expect(afterMaria.currentPlayerIndex).toBe(0);
    expect(afterMaria.players[2].isSkipped).toBe(false);
  });

  it('lets each player be skipped only once per round', () => {
    const skipped = {
      ...base,
      players: [
        base.players[0],
        { ...base.players[1], wasSkippedThisRound: true },
        base.players[2],
      ],
    };

    expect(skipTargets(skipped).map((p) => p.id)).toEqual(['Sam']);
    expect(discard(skipped, s.id, 'Maria')).toEqual({
      ok: false,
      reason: 'Maria has already been skipped this round.',
    });
  });

  it('discards a Skip with no effect when everyone else has been skipped', () => {
    const allSkipped = {
      ...base,
      players: base.players.map((p, i) => (i === 0 ? p : { ...p, wasSkippedThisRound: true })),
    };
    const next = unwrap(discard(allSkipped, s.id));

    expect(next.currentPlayerIndex).toBe(1);
    expect(next.players.some((p) => p.isSkipped)).toBe(false);
    expect(next.lastAction).toBe('Haris discarded a Skip');
  });

  it('gives the same player another turn when they skip the only other player', () => {
    const twoPlayers = { ...base, players: base.players.slice(0, 2) };

    expect(unwrap(discard(twoPlayers, s.id, 'Maria')).currentPlayerIndex).toBe(0);
  });

  it('ends the round when the last card is discarded', () => {
    const last = {
      ...base,
      players: [{ ...base.players[0], hand: [eight] }, ...base.players.slice(1)],
    };
    const next = unwrap(discard(last, eight.id));

    expect(next.view).toBe('roundSummary');
    expect(next.currentPlayerIndex).toBe(0);
    expect(next.lastAction).toBe('Haris went out');
  });

  it('does not mutate the input state', () => {
    const before = JSON.stringify(base);
    discard(base, s.id, 'Maria');
    draw({ ...base, turnStep: 'draw', discardPile: nums(1, 2, 3) }, 'deck');

    expect(JSON.stringify(base)).toBe(before);
  });
});

describe('turn edge cases', () => {
  it('ends the round when a Skip is the last card, still skipping the target', () => {
    const s = skip();
    const state = makeState({ players: [makePlayer('Haris', { hand: [s] }), makePlayer('Maria')] });
    const next = unwrap(discard(state, s.id, 'Maria'));

    expect(next.view).toBe('roundSummary');
    expect(next.lastAction).toBe('Haris went out');
    expect(next.players[1].wasSkippedThisRound).toBe(true);
  });

  it('passes over several skipped players in order', () => {
    const [s1, s2] = [skip(), skip()];
    const state = makeState({
      players: [
        makePlayer('Haris', { hand: [s1, num(1)] }),
        makePlayer('Maria', { hand: [s2, num(2)] }),
        makePlayer('Sam', { hand: [num(3)] }),
      ],
    });
    const afterHaris = unwrap(discard(state, s1.id, 'Sam'));
    const mariaTurn = { ...afterHaris, view: 'turn' as const, turnStep: 'play' as const };
    const afterMaria = unwrap(discard(mariaTurn, s2.id, 'Haris'));

    expect(afterMaria.currentPlayerIndex).toBe(1);
    expect(afterMaria.players.some((p) => p.isSkipped)).toBe(false);
    expect(afterMaria.lastAction).toBe(
      "Maria skipped Haris · Sam's turn was skipped · Haris's turn was skipped"
    );
  });

  it("hits a Wild onto another player's run", () => {
    const w = wild();
    const run = group('run', nums(9, 10, 11, 12), 'Maria-g1');
    const state = makeState({
      players: [
        makePlayer('Haris', { hand: [w, num(1)], hasLaidDown: true }),
        makePlayer('Maria', { laidGroups: [run], hasLaidDown: true }),
      ],
    });
    const next = unwrap(hit(state, w.id, 'Maria-g1'));

    expect(next.players[1].laidGroups[0].cards[0]).toBe(w);
  });

  it('rejects play before drawing, during the handoff and after the round', () => {
    const c = num(5);
    const state = makeState({
      players: [makePlayer('Haris', { hand: [c], hasLaidDown: true }), makePlayer('Maria')],
    });

    for (const [overrides, reason] of [
      [{ turnStep: 'draw' }, 'Draw a card first.'],
      [{ view: 'handoff' }, 'Show your cards first.'],
      [{ turnStep: 'done', view: 'roundSummary' }, 'The round is over.'],
    ] as const) {
      expect(discard({ ...state, ...overrides }, c.id)).toEqual({ ok: false, reason });
      expect(hit({ ...state, ...overrides }, c.id, 'g')).toEqual({ ok: false, reason });
    }
  });

  it('allows discarding the card just taken from the discard pile', () => {
    const top = num(9);
    const state = makeState({
      turnStep: 'draw',
      discardPile: [num(1), top],
      players: [makePlayer('Haris', { hand: [num(2)] }), makePlayer('Maria')],
    });
    const next = unwrap(discard(unwrap(draw(state, 'discard')), top.id));

    expect(next.discardPile.at(-1)).toBe(top);
  });

  it('does not mutate the input state when laying down or hitting', () => {
    const phaseCards = nums(3, 3, 3, 9, 9, 9);
    const extra = num(3);
    const state = makeState({
      players: [makePlayer('Haris', { hand: [...phaseCards, extra] }), makePlayer('Maria')],
    });
    const before = JSON.stringify(state);
    const laid = unwrap(layDown(state, ids(phaseCards)));
    const laidBefore = JSON.stringify(laid);
    hit(laid, extra.id, laid.players[0].laidGroups[0].id);

    expect(JSON.stringify(state)).toBe(before);
    expect(JSON.stringify(laid)).toBe(laidBefore);
  });
});
