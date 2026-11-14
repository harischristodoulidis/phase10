import { describe, expect, it } from 'vite-plus/test';

import { cardPoints, handPoints } from './scoring';
import { num, skip, wild } from './testUtils';

describe('cardPoints', () => {
  it('scores 5 for 1–9, 10 for 10–12, 15 for a Skip and 25 for a Wild', () => {
    expect(cardPoints(num(1))).toBe(5);
    expect(cardPoints(num(9))).toBe(5);
    expect(cardPoints(num(10))).toBe(10);
    expect(cardPoints(num(12))).toBe(10);
    expect(cardPoints(skip())).toBe(15);
    expect(cardPoints(wild())).toBe(25);
  });
});

describe('handPoints', () => {
  it('adds up the cards in a hand', () => {
    expect(handPoints([num(3), num(11), skip(), wild()])).toBe(55);
    expect(handPoints([])).toBe(0);
  });
});
