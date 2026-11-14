import { describe, expect, it } from 'vite-plus/test';

import { cardFace, cardLabel, cardName } from './cardView';
import { num, skip, wild } from './test/makeGame';

describe('cardView', () => {
  it('maps each card kind to a face', () => {
    expect(cardFace(num(4, 'green'))).toEqual({ tone: 'green', label: '4' });
    expect(cardFace(wild())).toEqual({ tone: 'wild', label: 'W' });
    expect(cardFace(skip())).toEqual({ tone: 'skip', label: 'SKIP' });
  });

  it('names cards for screen readers', () => {
    expect(cardName(num(11, 'yellow'))).toBe('yellow 11');
    expect(cardLabel(num(4), true)).toBe('red 4, selected');
    expect(cardLabel(wild(), false)).toBe('Wild');
    expect(cardLabel(skip(), false)).toBe('Skip');
  });
});
