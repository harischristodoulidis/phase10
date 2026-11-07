import { describe, expect, it } from 'vite-plus/test';

import { createRng } from '@lib/rng';

import { CARD_COLORS, CARD_VALUES, DECK_SIZE, HAND_SIZE } from './constants';
import { createDeck, deal, dealerForFirstRound, leftOf, shuffle } from './deck';
import type { Card, PlayerCount } from './types';

const PLAYER_COUNTS: readonly PlayerCount[] = [2, 3, 4, 5, 6];

function ids(cards: readonly Card[]): string[] {
  return cards.map((card) => card.id);
}

describe('createDeck', () => {
  const deck = createDeck();

  it('has 108 cards with unique ids', () => {
    expect(deck).toHaveLength(108);
    expect(DECK_SIZE).toBe(108);
    expect(new Set(ids(deck)).size).toBe(108);
  });

  it('has exactly two of each number in each color', () => {
    for (const color of CARD_COLORS) {
      for (const value of CARD_VALUES) {
        const matches = deck.filter(
          (card) => card.kind === 'number' && card.color === color && card.value === value
        );
        expect(matches).toHaveLength(2);
      }
    }
    expect(deck.filter((card) => card.kind === 'number')).toHaveLength(96);
  });

  it('has 8 Wilds and 4 Skips', () => {
    expect(deck.filter((card) => card.kind === 'wild')).toHaveLength(8);
    expect(deck.filter((card) => card.kind === 'skip')).toHaveLength(4);
  });
});

describe('shuffle', () => {
  const deck = createDeck();

  it('gives the same order for the same seed', () => {
    expect(ids(shuffle(deck, createRng(42)))).toEqual(ids(shuffle(deck, createRng(42))));
  });

  it('gives a different order for a different seed', () => {
    expect(ids(shuffle(deck, createRng(1)))).not.toEqual(ids(shuffle(deck, createRng(2))));
  });

  it('returns a permutation of the input', () => {
    const shuffled = shuffle(deck, createRng(7));

    expect(ids(shuffled)).not.toEqual(ids(deck));
    expect([...ids(shuffled)].sort()).toEqual([...ids(deck)].sort());
  });

  it('does not mutate the input', () => {
    const before = ids(deck);
    shuffle(deck, createRng(7));

    expect(ids(deck)).toEqual(before);
  });
});

describe('deal', () => {
  const deck = shuffle(createDeck(), createRng(42));

  it.each(PLAYER_COUNTS)('deals 10 cards each to %i players', (count) => {
    const { hands, drawPile, discardPile } = deal(deck, count, dealerForFirstRound(count));

    expect(hands).toHaveLength(count);
    for (const hand of hands) {
      expect(hand).toHaveLength(HAND_SIZE);
    }
    expect(drawPile).toHaveLength(108 - HAND_SIZE * count - 1);
    expect(discardPile).toHaveLength(1);
  });

  it.each(PLAYER_COUNTS)('keeps every card exactly once with %i players', (count) => {
    const { hands, drawPile, discardPile } = deal(deck, count, 0);
    const all = [...hands.flat(), ...drawPile, ...discardPile];

    expect([...ids(all)].sort()).toEqual([...ids(deck)].sort());
  });

  it('flips the top of the remaining cards to start the discard pile', () => {
    const { discardPile } = deal(deck, 4, 3);

    expect(discardPile[0]).toBe(deck[deck.length - 1 - HAND_SIZE * 4]);
  });

  it('deals the first card to the player left of the dealer, then in turn', () => {
    const top = deck.length - 1;
    const { hands } = deal(deck, 4, 1);

    expect(hands[2][0]).toBe(deck[top]);
    expect(hands[3][0]).toBe(deck[top - 1]);
    expect(hands[0][0]).toBe(deck[top - 2]);
    expect(hands[1][0]).toBe(deck[top - 3]);
  });

  it('does not mutate the deck', () => {
    const before = ids(deck);
    deal(deck, 6, 5);

    expect(ids(deck)).toEqual(before);
  });
});

describe('seating', () => {
  it.each(PLAYER_COUNTS)('makes the last of %i players the dealer in Round 1', (count) => {
    expect(dealerForFirstRound(count)).toBe(count - 1);
  });

  it.each(PLAYER_COUNTS)('gives the first turn of Round 1 to player 1 of %i', (count) => {
    expect(leftOf(dealerForFirstRound(count), count)).toBe(0);
  });

  it('gives the first turn to the player left of the dealer', () => {
    expect(leftOf(1, 4)).toBe(2);
  });

  it('passes the dealer role one seat left each round, wrapping around', () => {
    const dealers = [dealerForFirstRound(3)];
    for (let round = 2; round <= 4; round++) {
      dealers.push(leftOf(dealers[dealers.length - 1], 3));
    }

    expect(dealers).toEqual([2, 0, 1, 2]);
  });
});
