import { describe, expect, it } from 'vite-plus/test';

import { canDraw, draw } from './draw';
import { ids, makeState, nums, skip, unwrap, wild } from './testUtils';

describe('draw', () => {
  const [a, b, c] = nums(1, 2, 3);

  it('takes the top of the draw pile', () => {
    const next = unwrap(draw(makeState({ turnStep: 'draw', drawPile: [a, b] }), 'deck'));

    expect(ids(next.players[0].hand)).toEqual([b.id]);
    expect(next.drawPile).toEqual([a]);
    expect(next.turnStep).toBe('play');
  });

  it('takes the top of the discard pile, including a Wild', () => {
    const w = wild();
    const next = unwrap(draw(makeState({ turnStep: 'draw', discardPile: [c, w] }), 'discard'));

    expect(next.players[0].hand).toEqual([w]);
    expect(next.discardPile).toEqual([c]);
  });

  it("can't pick up a Skip from the discard pile", () => {
    expect(draw(makeState({ turnStep: 'draw', discardPile: [a, skip()] }), 'discard')).toEqual({
      ok: false,
      reason: "A Skip can't be picked up.",
    });
  });

  it('allows only one draw per turn, and only once the cards are showing', () => {
    expect(draw(makeState({ drawPile: [a] }), 'deck')).toEqual({
      ok: false,
      reason: "You've already drawn a card this turn.",
    });
    expect(draw(makeState({ turnStep: 'draw', view: 'handoff', drawPile: [a] }), 'deck').ok).toBe(
      false
    );
  });

  it('reshuffles the discard pile, except its top card, when the draw pile is empty', () => {
    const pile = nums(1, 2, 3, 4, 5);
    const state = makeState({ turnStep: 'draw', discardPile: pile });
    const next = unwrap(draw(state, 'deck'));

    expect(next.discardPile).toEqual([pile[4]]);
    expect(next.drawPile).toHaveLength(3);
    expect([...ids(next.drawPile), ...ids(next.players[0].hand)].sort()).toEqual(
      ids(pile.slice(0, 4)).sort()
    );
    expect(next.rngSeed).not.toBe(state.rngSeed);
    expect(unwrap(draw(state, 'deck'))).toEqual(next);
  });

  it('sends the player to the discard pile when only it has a card', () => {
    expect(draw(makeState({ turnStep: 'draw', discardPile: [a] }), 'deck')).toEqual({
      ok: false,
      reason: 'The draw pile is empty. Take the top discard instead.',
    });
  });
});

describe('draw edge cases', () => {
  it('skips the draw step when neither pile has a card that can be drawn', () => {
    const state = makeState({ turnStep: 'draw', discardPile: [skip()] });
    const next = unwrap(draw(state, 'deck'));

    expect(canDraw(state)).toBe(false);
    expect(next.turnStep).toBe('play');
    expect(next.players[0].hand).toEqual([]);
    expect(next.discardPile).toEqual(state.discardPile);
  });

  it('keeps a Skip on top of the discard pile when reshuffling', () => {
    const s = skip();
    const next = unwrap(
      draw(makeState({ turnStep: 'draw', discardPile: [...nums(1, 2, 3), s] }), 'deck')
    );

    expect(next.discardPile).toEqual([s]);
    expect(next.drawPile).toHaveLength(2);
  });
});
