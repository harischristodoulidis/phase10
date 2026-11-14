import { describe, expect, it } from 'vite-plus/test';

import { draw } from './draw';
import { arrangeHand } from './hand';
import { ids, makePlayer, makeState, num, skip, unwrap, wild } from './testUtils';
import { discard } from './turn';

function stateWithHand(overrides: Parameters<typeof makeState>[0] = {}) {
  const hand = [num(3), wild(), skip(), num(7)];
  const other = makePlayer('Maria', { hand: [num(1), num(2)] });
  const state = makeState({
    players: [makePlayer('Haris', { hand }), other, makePlayer('Sam')],
    ...overrides,
  });
  return { state, hand, other };
}

describe('arrangeHand', () => {
  it('puts the hand in the chosen order', () => {
    const { state, hand } = stateWithHand();
    const order = [hand[2], hand[0], hand[3], hand[1]];
    const next = unwrap(arrangeHand(state, ids(order)));

    expect(next.players[0].hand).toEqual(order);
  });

  it('works before and after drawing without changing the step', () => {
    for (const turnStep of ['draw', 'play'] as const) {
      const { state, hand } = stateWithHand({ turnStep });
      const next = unwrap(arrangeHand(state, ids([...hand].reverse())));

      expect(next.turnStep).toBe(turnStep);
      expect(next.lastAction).toBe(state.lastAction);
    }
  });

  it('changes nothing but the current hand’s order', () => {
    const { state, hand } = stateWithHand({ drawPile: [num(5)], discardPile: [num(6)] });
    const order = [...hand].reverse();
    const next = unwrap(arrangeHand(state, ids(order)));

    expect(next).toEqual({
      ...state,
      players: [{ ...state.players[0], hand: order }, ...state.players.slice(1)],
    });
    expect(next.players[1]).toBe(state.players[1]);
    expect(next.drawPile).toBe(state.drawPile);
    expect(next.discardPile).toBe(state.discardPile);
  });

  it('keeps the order through a draw and a discard, with the drawn card last', () => {
    const drawn = num(9);
    const { state, hand } = stateWithHand({ turnStep: 'draw', drawPile: [drawn] });
    const order = [hand[3], hand[0], hand[1], hand[2]];
    const drew = unwrap(draw(unwrap(arrangeHand(state, ids(order))), 'deck'));

    expect(drew.players[0].hand).toEqual([...order, drawn]);

    const discarded = unwrap(discard(drew, hand[0].id));
    expect(discarded.players[0].hand).toEqual([hand[3], hand[1], hand[2], drawn]);
  });

  it('rejects an order that misses, adds or repeats a card', () => {
    const { state, hand, other } = stateWithHand();
    const [a, b, c, d] = ids(hand);

    expect(arrangeHand(state, [a, b, c]).ok).toBe(false);
    expect(arrangeHand(state, [a, b, c, d, other.hand[0].id]).ok).toBe(false);
    expect(arrangeHand(state, [a, b, c, c]).ok).toBe(false);
    expect(arrangeHand(state, [a, b, c, other.hand[0].id]).ok).toBe(false);
  });

  it('is refused before the cards are shown and after the round ends', () => {
    const { hand } = stateWithHand();
    const handoff = stateWithHand({ view: 'handoff' }).state;
    const ended = stateWithHand({ view: 'roundSummary', turnStep: 'done' }).state;
    const over = stateWithHand({ view: 'gameOver', turnStep: 'done' }).state;

    expect(arrangeHand(handoff, ids(hand))).toEqual({
      ok: false,
      reason: 'Show your cards first.',
    });
    expect(arrangeHand(ended, ids(hand))).toEqual({ ok: false, reason: 'The round is over.' });
    expect(arrangeHand(over, ids(hand))).toEqual({ ok: false, reason: 'The round is over.' });
  });
});
