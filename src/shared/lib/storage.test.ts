import { afterEach, describe, expect, it } from 'vite-plus/test';

import { loadJson, saveJson } from './storage';

afterEach(() => localStorage.clear());

describe('storage', () => {
  it('round-trips a value as JSON', () => {
    saveJson('key', { a: [1, 2] });

    expect(loadJson('key')).toEqual({ a: [1, 2] });
  });

  it('returns undefined for a missing key', () => {
    expect(loadJson('missing')).toBeUndefined();
  });

  it('returns undefined for invalid JSON', () => {
    localStorage.setItem('key', '{not json');

    expect(loadJson('key')).toBeUndefined();
  });
});
