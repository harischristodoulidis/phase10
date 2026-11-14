import { describe, expect, it } from 'vite-plus/test';

import { HINTS } from './constants';
import { num, skip } from './test/makeGame';
import { turnHint, type HintInput } from './turnHint';

const base: HintInput = {
  step: 'play',
  error: null,
  selected: [],
  hasPlaced: false,
  hasLaidDown: false,
  topDiscard: num(7),
  hasCardsToDraw: true,
  hasSkipTargets: true,
  pending: null,
};

describe('turnHint', () => {
  it('asks for a draw first', () => {
    expect(turnHint({ ...base, step: 'draw' })).toBe(HINTS.draw);
  });

  it('warns that a Skip on the discard pile can’t be taken', () => {
    expect(turnHint({ ...base, step: 'draw', topDiscard: skip() })).toBe(HINTS.skipOnDiscard);
  });

  it('explains when there is nothing to draw', () => {
    expect(turnHint({ ...base, step: 'draw', hasCardsToDraw: false })).toBe(HINTS.nothingToDraw);
  });

  it('explains the play step before and after laying down', () => {
    expect(turnHint(base)).toBe(HINTS.play);
    expect(turnHint({ ...base, hasLaidDown: true })).toBe(HINTS.playLaidDown);
  });

  it('keeps the player filling the slots once a card is placed', () => {
    expect(turnHint({ ...base, hasPlaced: true })).toBe(HINTS.placing);
  });

  it('tells a tapping player where the selected card can go', () => {
    expect(turnHint({ ...base, selected: [num(3)] })).toBe(HINTS.selected);
    expect(turnHint({ ...base, selected: [num(3), skip()] })).toBe(HINTS.selectedMany(2));
    expect(turnHint({ ...base, selected: [skip()] })).toBe(HINTS.selectedSkip);
    expect(turnHint({ ...base, selected: [skip()], hasSkipTargets: false })).toBe(
      HINTS.discardSkipNoTarget
    );
  });

  it('shows why a move was refused', () => {
    expect(turnHint({ ...base, error: 'Nope', selected: [num(3)] })).toBe('Nope');
  });

  it('ends the turn once a discard is chosen', () => {
    expect(turnHint({ ...base, pending: { skipTargetName: null } })).toBe(HINTS.done);
    expect(turnHint({ ...base, pending: { skipTargetName: 'Ben' } })).toBe(HINTS.skipPlayed('Ben'));
  });
});
