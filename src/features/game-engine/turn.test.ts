import { describe, expect, it } from 'vite-plus/test';

import { draw } from './draw';
import { skipTargets } from './skip';
import { group, ids, makePlayer, makeState, num, nums, skip, unwrap, wild } from './testUtils';
import { discard, hit, layDown, revealHand } from './turn';
import type { Card } from './types';

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
  const slots = [ids(phaseCards.slice(0, 3)), ids(phaseCards.slice(3))];
  const extra = num(3);
  const state = makeState({
    players: [makePlayer('Haris', { hand: [...phaseCards, extra] }), makePlayer('Maria')],
  });

  it('moves a valid phase from the hand to the table, one group per slot', () => {
    const player = unwrap(layDown(state, slots)).players[0];

    expect(player.hand).toEqual([extra]);
    expect(player.hasLaidDown).toBe(true);
    expect(player.laidGroups.map((g) => [g.id, g.type, ids(g.cards)])).toEqual([
      ['Haris-g1', 'set', slots[0]],
      ['Haris-g2', 'set', slots[1]],
    ]);
  });

  it('keeps the player’s grouping and checks each slot against its own group', () => {
    const [seven, eight, nine, ten] = nums(7, 8, 9, 10);
    const run = [seven, wild(), nine, ten];
    const set = [num(5), num(5), wild()];
    const phase2 = makeState({
      players: [makePlayer('Haris', { phase: 2, hand: [...set, ...run, eight] })],
    });
    const laid = unwrap(layDown(phase2, [ids(set), ids(run)])).players[0].laidGroups;

    expect(laid.map((g) => g.type)).toEqual(['set', 'run']);
    expect(laid[1].cards.map((c) => (c.kind === 'number' ? c.value : 'W'))).toEqual([
      7,
      'W',
      9,
      10,
    ]);
    expect(layDown(phase2, [ids(run.slice(0, 3)), ids([...set, eight])])).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make a set of 3.",
    });
  });

  it('rejects a slot that does not make its group, or the wrong number of slots', () => {
    expect(layDown(state, [slots[0], [...slots[1].slice(0, 2), extra.id]])).toEqual({
      ok: false,
      reason: "Not quite — these cards don't make a set of 3.",
    });
    expect(layDown(state, [ids(phaseCards)]).ok).toBe(false);
    expect(layDown(state, [[...slots[0], extra.id], slots[1].slice(0, 2)])).toEqual({
      ok: false,
      reason: 'Slot 1 needs exactly 3 cards.',
    });
  });

  it('places a run slot’s Wild at whichever end fits', () => {
    const runPhase = (run: Card[]) => {
      const set = nums(5, 5, 5);
      const phase2 = makeState({
        players: [makePlayer('Haris', { phase: 2, hand: [...set, ...run] })],
      });
      const laid = unwrap(layDown(phase2, [ids(set), ids(run)])).players[0].laidGroups[1];
      return laid.cards.map((c) => (c.kind === 'number' ? c.value : 'W'));
    };

    expect(runPhase([...nums(10, 11, 12), wild()])).toEqual(['W', 10, 11, 12]);
    expect(runPhase([...nums(3, 4, 5), wild()])).toEqual([3, 4, 5, 'W']);
  });

  it('allows only one lay down per round', () => {
    const next = unwrap(layDown(state, slots));

    expect(layDown(next, slots).ok).toBe(false);
  });

  it('rejects cards that are not in the hand, and laying down before drawing', () => {
    expect(layDown(state, [['nope', ...slots[0].slice(1)], slots[1]]).ok).toBe(false);
    expect(layDown(state, [slots[0], slots[0]]).ok).toBe(false);
    expect(layDown({ ...state, turnStep: 'draw' }, slots)).toEqual({
      ok: false,
      reason: 'Draw a card first.',
    });
  });

  it('allows a hit on the same turn as laying down', () => {
    const laid = unwrap(layDown(state, slots));
    const threes = laid.players[0].laidGroups.find((g) =>
      g.cards.some((c) => c.id === phaseCards[0].id)
    );
    const next = unwrap(hit(laid, [extra.id], threes?.id ?? ''));

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
    const next = unwrap(hit(state, [seven.id], 'Maria-g1'));

    expect(next.players[0].hand).toEqual([two]);
    expect(next.players[1].laidGroups[0].cards).toEqual([...mariaSet.cards, seven]);
  });

  it('needs your own phase down first', () => {
    const notDown = {
      ...state,
      players: [{ ...state.players[0], hasLaidDown: false }, state.players[1]],
    };

    expect(hit(notDown, [seven.id], 'Maria-g1')).toEqual({
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

    expect(hit(state, [two.id], 'Maria-g1').ok).toBe(false);
    expect(hit(withSkip, [s.id], 'Maria-g1')).toEqual({
      ok: false,
      reason: "A Skip can't be used as a hit.",
    });
    expect(hit(state, [seven.id], 'nope').ok).toBe(false);
  });

  it('adds several cards at once, or none if any of them does not fit', () => {
    const run = group('run', nums(7, 8, 9, 10), 'Maria-g1');
    const [five, six, eleven] = nums(5, 6, 11);
    const w = wild();
    const several = makeState({
      players: [
        makePlayer('Haris', { hand: [five, six, w, eleven, two], hasLaidDown: true }),
        makePlayer('Maria', { laidGroups: [run], hasLaidDown: true }),
      ],
    });
    const next = unwrap(hit(several, [five.id, w.id, six.id, eleven.id], 'Maria-g1'));
    const values = next.players[1].laidGroups[0].cards.map((c) =>
      c.kind === 'number' ? c.value : 'W'
    );

    expect(values).toEqual([5, 6, 7, 8, 9, 10, 11, 'W']);
    expect(next.players[0].hand).toEqual([two]);
    expect(hit(several, [six.id, two.id], 'Maria-g1')).toEqual({
      ok: false,
      reason: "These cards don't all fit this group.",
    });
    expect(hit(several, [], 'Maria-g1').ok).toBe(false);
    expect(hit(several, [six.id, six.id], 'Maria-g1')).toEqual({
      ok: false,
      reason: 'Pick each card only once.',
    });
  });

  it('refuses a Skip among several hit cards, and goes out when they empty the hand', () => {
    const s = skip();
    const w = wild();
    const withSkip = {
      ...state,
      players: [{ ...state.players[0], hand: [seven, s] }, state.players[1]],
    };
    const lastTwo = {
      ...state,
      players: [{ ...state.players[0], hand: [seven, w] }, state.players[1]],
    };

    expect(hit(withSkip, [seven.id, s.id], 'Maria-g1')).toEqual({
      ok: false,
      reason: "A Skip can't be used as a hit.",
    });
    expect(unwrap(hit(lastTwo, [seven.id, w.id], 'Maria-g1')).view).toBe('roundSummary');
  });

  it('ends the round when the last card is hit', () => {
    const last = { ...state, players: [{ ...state.players[0], hand: [seven] }, state.players[1]] };
    const next = unwrap(hit(last, [seven.id], 'Maria-g1'));

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
    const next = unwrap(hit(tiebreak, [seven.id], 'Maria-g1'));

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
    const next = unwrap(hit(state, [w.id], 'Maria-g1'));

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
      expect(hit({ ...state, ...overrides }, [c.id], 'g')).toEqual({ ok: false, reason });
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
    const laid = unwrap(layDown(state, [ids(phaseCards.slice(0, 3)), ids(phaseCards.slice(3))]));
    const laidBefore = JSON.stringify(laid);
    hit(laid, [extra.id], laid.players[0].laidGroups[0].id);

    expect(JSON.stringify(state)).toBe(before);
    expect(JSON.stringify(laid)).toBe(laidBefore);
  });
});
