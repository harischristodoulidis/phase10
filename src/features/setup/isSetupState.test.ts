import { describe, expect, it } from 'vite-plus/test';

import { isSetupState } from './isSetupState';

const names = ['A', 'B', '', '', '', ''];

describe('isSetupState', () => {
  it('accepts a valid setup state', () => {
    expect(isSetupState({ playerCount: 2, names })).toBe(true);
  });

  it('rejects a player count outside 2–6', () => {
    expect(isSetupState({ playerCount: 1, names })).toBe(false);
    expect(isSetupState({ playerCount: 7, names })).toBe(false);
    expect(isSetupState({ playerCount: '4', names })).toBe(false);
  });

  it('rejects names of the wrong length or type', () => {
    expect(isSetupState({ playerCount: 4, names: ['A', 'B'] })).toBe(false);
    expect(isSetupState({ playerCount: 4, names: ['A', 'B', 'C', 'D', 'E', 6] })).toBe(false);
    expect(isSetupState({ playerCount: 4, names: 'ABCDEF' })).toBe(false);
  });

  it('rejects non-objects and missing fields', () => {
    expect(isSetupState(null)).toBe(false);
    expect(isSetupState('setup')).toBe(false);
    expect(isSetupState({ playerCount: 4 })).toBe(false);
  });
});
