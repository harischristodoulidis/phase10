import { describe, expect, it } from 'vite-plus/test';

import { itemOf, zoneOf } from './dragData';

describe('itemOf', () => {
  it('reads back the items this feature attaches', () => {
    expect(itemOf({ item: { kind: 'handCard', cardId: 'c1' } })).toEqual({
      kind: 'handCard',
      cardId: 'c1',
    });
    expect(itemOf({ item: { kind: 'placedCard', cardId: 'c1', slot: 1 } })).toEqual({
      kind: 'placedCard',
      cardId: 'c1',
      slot: 1,
    });
    expect(itemOf({ item: { kind: 'deck' } })).toEqual({ kind: 'deck' });
    expect(itemOf({ item: { kind: 'handCards', cardIds: ['c1', 'c2'] } })).toEqual({
      kind: 'handCards',
      cardIds: ['c1', 'c2'],
    });
    expect(itemOf({ item: { kind: 'slotCards', slot: 1, cardIds: ['c1', 'c2'] } })).toEqual({
      kind: 'slotCards',
      slot: 1,
      cardIds: ['c1', 'c2'],
    });
  });

  it('rejects anything malformed', () => {
    expect(itemOf(undefined)).toBeNull();
    expect(itemOf({ item: { kind: 'handCard' } })).toBeNull();
    expect(itemOf({ item: { kind: 'placedCard', cardId: 'c1' } })).toBeNull();
    expect(itemOf({ item: { kind: 'other' } })).toBeNull();
    expect(itemOf({ item: { kind: 'handCards', cardIds: ['c1', 2] } })).toBeNull();
    expect(itemOf({ item: { kind: 'slotCards', cardIds: ['c1'] } })).toBeNull();
  });
});

describe('zoneOf', () => {
  it('reads back the drop zones this feature attaches', () => {
    expect(zoneOf({ zone: { kind: 'slot', slot: 0 } })).toEqual({ kind: 'slot', slot: 0 });
    expect(zoneOf({ zone: { kind: 'group', groupId: 'g1' } })).toEqual({
      kind: 'group',
      groupId: 'g1',
    });
    expect(zoneOf({ zone: { kind: 'discard' } })).toEqual({ kind: 'discard' });
  });

  it('rejects anything malformed', () => {
    expect(zoneOf(null)).toBeNull();
    expect(zoneOf({ zone: { kind: 'slot' } })).toBeNull();
    expect(zoneOf({ zone: 'hand' })).toBeNull();
  });
});
