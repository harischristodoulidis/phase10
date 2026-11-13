import { describe, expect, it } from 'vite-plus/test';

import { HINTS } from './constants';
import { skip, num } from './test/makeGame';
import { turnHint, type HintInput } from './turnHint';

const base: HintInput = {
  step: 'play',
  mode: 'play',
  layError: null,
  selected: [],
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

  it('explains the play step', () => {
    expect(turnHint(base)).toBe(HINTS.play);
    expect(turnHint({ ...base, hasLaidDown: true })).toBe(HINTS.playLaidDown);
  });

  it('follows the selected card', () => {
    expect(turnHint({ ...base, selected: [num(3)] })).toBe(HINTS.discardSelected);
    expect(turnHint({ ...base, selected: [skip()] })).toBe(HINTS.discardSkip);
    expect(turnHint({ ...base, selected: [skip()], hasSkipTargets: false })).toBe(
      HINTS.discardSkipNoTarget
    );
  });

  it('shows the laying instructions or the validation error', () => {
    expect(turnHint({ ...base, mode: 'laying' })).toBe(HINTS.laying);
    expect(turnHint({ ...base, mode: 'laying', layError: 'Nope' })).toBe('Nope');
  });

  it('ends the turn once a discard is chosen', () => {
    expect(turnHint({ ...base, pending: { skipTargetName: null } })).toBe(HINTS.done);
    expect(turnHint({ ...base, pending: { skipTargetName: 'Ben' } })).toBe(HINTS.skipPlayed('Ben'));
  });
});
