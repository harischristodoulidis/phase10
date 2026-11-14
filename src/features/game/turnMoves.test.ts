import { describe, expect, it } from 'vite-plus/test';

import { getPhase, type Card, type Group } from '@features/game-engine';

import { MOVE_COPY } from './constants';
import { num, skip, wild } from './test/makeGame';
import { resolveMove, type MoveContext } from './turnMoves';

const [four, fourBlue, nine, eight] = [num(4), num(4, 'blue'), num(9), num(8)];
const skipCard = skip();
const wildCard = wild();
const cards: Card[] = [four, fourBlue, nine, eight, skipCard, wildCard];
const sevens: Group = { id: 'Ben-g1', type: 'set', cards: [num(7), num(7), num(7)] };

const play: MoveContext = {
  canAct: true,
  canDrawDeck: false,
  canTakeDiscard: false,
  hasPendingDiscard: false,
  cards,
  phase: getPhase(1),
  placed: [[four], []],
  groups: [sevens],
  hasLaidDown: false,
};
const draw: MoveContext = { ...play, canAct: false, canDrawDeck: true, canTakeDiscard: true };
const laidDown: MoveContext = { ...play, placed: [], hasLaidDown: true };

const hand = (card: Card) => ({ kind: 'handCard', cardId: card.id }) as const;

describe('resolveMove', () => {
  it('draws when a pile is dropped on the hand during the draw step', () => {
    expect(resolveMove({ kind: 'deck' }, { kind: 'hand' }, draw)).toEqual({
      kind: 'move',
      move: { kind: 'draw', source: 'deck' },
    });
    expect(resolveMove({ kind: 'discardTop' }, { kind: 'hand' }, draw)).toEqual({
      kind: 'move',
      move: { kind: 'draw', source: 'discard' },
    });
    expect(resolveMove({ kind: 'discardTop' }, { kind: 'hand' }, play).kind).toBe('none');
    expect(resolveMove({ kind: 'deck' }, { kind: 'discard' }, draw).kind).toBe('none');
  });

  it('takes a chosen discard back until Next player', () => {
    const done = { ...play, canAct: false, hasPendingDiscard: true };

    expect(resolveMove({ kind: 'discardTop' }, { kind: 'hand' }, done)).toEqual({
      kind: 'move',
      move: { kind: 'undoDiscard' },
    });
    expect(resolveMove({ kind: 'discardTop' }, { kind: 'slot', slot: 0 }, done).kind).toBe('none');
  });

  it('plays no card before the draw', () => {
    expect(resolveMove(hand(nine), { kind: 'discard' }, draw).kind).toBe('none');
  });

  it('discards any card, including a Skip', () => {
    expect(resolveMove(hand(skipCard), { kind: 'discard' }, play)).toEqual({
      kind: 'move',
      move: { kind: 'discard', cardId: skipCard.id },
    });
  });

  it('places a single card only when it completes the slot', () => {
    const almost = { ...play, cards: [...cards, num(4, 'green')], placed: [[four, fourBlue], []] };

    expect(resolveMove(hand(wildCard), { kind: 'slot', slot: 0 }, almost)).toEqual({
      kind: 'move',
      move: { kind: 'place', cardIds: [wildCard.id], slot: 0 },
    });
    expect(resolveMove(hand(nine), { kind: 'slot', slot: 0 }, almost).kind).toBe('refused');
    expect(resolveMove(hand(fourBlue), { kind: 'slot', slot: 0 }, play).kind).toBe('refused');
    expect(resolveMove(hand(nine), { kind: 'slot', slot: 1 }, play).kind).toBe('refused');
    expect(resolveMove(hand(skipCard), { kind: 'slot', slot: 1 }, play)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.skipInPhase,
    });
  });

  it('moves a placed card back to the hand, but not alone into another slot', () => {
    const placed = { kind: 'placedCard', cardId: four.id, slot: 0 } as const;

    expect(resolveMove(placed, { kind: 'hand' }, play)).toEqual({
      kind: 'move',
      move: { kind: 'takeBack', cardIds: [four.id] },
    });
    expect(resolveMove(placed, { kind: 'slot', slot: 1 }, play).kind).toBe('refused');
    expect(resolveMove(placed, { kind: 'slot', slot: 0 }, play).kind).toBe('none');
    expect(resolveMove(placed, { kind: 'discard' }, play)).toEqual({
      kind: 'move',
      move: { kind: 'discard', cardId: four.id },
    });
  });

  it('moves a placed card into another slot when it completes it', () => {
    const nineBlue = num(9, 'blue');
    const ctx = {
      ...play,
      cards: [...cards, nineBlue],
      placed: [
        [four, fourBlue, wildCard],
        [nine, nineBlue],
      ],
    };
    const wildItem = { kind: 'placedCard', cardId: wildCard.id, slot: 0 } as const;

    expect(resolveMove(wildItem, { kind: 'slot', slot: 1 }, ctx)).toEqual({
      kind: 'move',
      move: { kind: 'place', cardIds: [wildCard.id], slot: 1 },
    });
  });

  it('refuses a card onto a full slot, or a last Wild', () => {
    const lastWild = wild();
    const full = {
      ...play,
      cards: [...cards, lastWild],
      placed: [
        [four, fourBlue, num(4, 'green')],
        [wildCard, wild()],
      ],
    };

    const fours = { ...full, placed: [full.placed[0] ?? [], []] };
    const wilds = { ...full, placed: [[], full.placed[1] ?? []] };

    expect(resolveMove(hand(nine), { kind: 'slot', slot: 0 }, fours).kind).toBe('refused');
    expect(resolveMove(hand(lastWild), { kind: 'slot', slot: 1 }, wilds).kind).toBe('refused');
    const completes = resolveMove(hand(nine), { kind: 'slot', slot: 0 }, full);
    expect(completes.kind === 'move' && completes.move.kind).toBe('layDown');
  });

  it('refuses fewer cards than a slot needs, even if they would fit', () => {
    expect(
      resolveMove(
        { kind: 'handCards', cardIds: [four.id, fourBlue.id] },
        { kind: 'slot', slot: 1 },
        play
      )
    ).toEqual({
      kind: 'refused',
      reason: 'This slot needs exactly 3 cards — select them all, then drop them together.',
    });
  });

  it('hits only once the phase is down, and only a group the card fits', () => {
    const sevensZone = { kind: 'group', groupId: sevens.id } as const;
    const seven = num(7, 'green');
    const withSeven = { ...laidDown, cards: [...cards, seven] };

    expect(resolveMove(hand(wildCard), sevensZone, play)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.layDownFirst,
    });
    expect(resolveMove(hand(seven), sevensZone, withSeven)).toEqual({
      kind: 'move',
      move: { kind: 'hit', cardIds: [seven.id], groupId: sevens.id },
    });
    expect(resolveMove(hand(nine), sevensZone, laidDown)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.cantHit('red 9'),
    });
    expect(resolveMove(hand(nine), { kind: 'slot', slot: 0 }, laidDown).kind).toBe('none');
  });

  it('ignores cards that are not in play and drops back onto the hand', () => {
    expect(resolveMove({ kind: 'handCard', cardId: 'gone' }, { kind: 'discard' }, play).kind).toBe(
      'none'
    );
    expect(resolveMove(hand(nine), { kind: 'hand' }, play).kind).toBe('none');
  });
});

describe('resolveMove with several cards', () => {
  const [fourGreen, nineBlue, nineGreen] = [num(4, 'green'), num(9, 'blue'), num(9, 'green')];
  const sevenGreen = num(7, 'green');
  const many: MoveContext = {
    ...play,
    cards: [...cards, fourGreen, nineBlue, nineGreen, sevenGreen],
    placed: [[], []],
  };
  const several = (...picked: Card[]) =>
    ({ kind: 'handCards', cardIds: picked.map((c) => c.id) }) as const;

  it('places cards that complete the slot they were dropped on', () => {
    expect(
      resolveMove(several(four, fourBlue, fourGreen), { kind: 'slot', slot: 1 }, many)
    ).toEqual({
      kind: 'move',
      move: { kind: 'place', cardIds: [four.id, fourBlue.id, fourGreen.id], slot: 1 },
    });
  });

  it('lays down a whole phase dropped on one slot, split into its groups', () => {
    const result = resolveMove(
      several(nine, four, nineBlue, fourBlue, nineGreen, fourGreen),
      { kind: 'slot', slot: 0 },
      many
    );

    expect(result.kind === 'move' && result.move.kind).toBe('layDown');
    expect(
      result.kind === 'move' && result.move.kind === 'layDown' && result.move.slots.flat()
    ).toHaveLength(6);
  });

  it('refuses a mix that fits neither, a Skip, and a discard of several cards', () => {
    expect(resolveMove(several(four, nine), { kind: 'slot', slot: 0 }, many).kind).toBe('refused');
    expect(resolveMove(several(four, skipCard), { kind: 'slot', slot: 0 }, many)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.skipInPhase,
    });
    expect(resolveMove(several(four, nine), { kind: 'discard' }, many)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.discardOne,
    });
  });

  it('hits a group only when every card fits', () => {
    const sevensZone = { kind: 'group', groupId: sevens.id } as const;
    const down = { ...many, hasLaidDown: true };

    expect(resolveMove(several(wildCard, sevenGreen), sevensZone, down)).toEqual({
      kind: 'move',
      move: { kind: 'hit', cardIds: [wildCard.id, sevenGreen.id], groupId: sevens.id },
    });
    expect(resolveMove(several(wildCard, nine), sevensZone, down)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.cantHitAll,
    });
    expect(resolveMove(several(sevenGreen, skipCard), sevensZone, down)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.skipInGroup,
    });
  });

  it('treats a one-card selection like a single card', () => {
    expect(resolveMove(several(nine), { kind: 'discard' }, many).kind).toBe('move');
  });
});

describe('resolveMove with a whole slot', () => {
  const fourGreen = num(4, 'green');
  const fours = [four, fourBlue, fourGreen];
  const filled: MoveContext = { ...play, cards: [...cards, fourGreen], placed: [fours, []] };
  const slotCards = { kind: 'slotCards', slot: 0, cardIds: fours.map((c) => c.id) } as const;

  it('takes every card in the slot back to the hand', () => {
    expect(resolveMove(slotCards, { kind: 'hand' }, filled)).toEqual({
      kind: 'move',
      move: { kind: 'takeBack', cardIds: slotCards.cardIds },
    });
  });

  it('moves the slot to another slot it completes, and ignores its own slot', () => {
    expect(resolveMove(slotCards, { kind: 'slot', slot: 1 }, filled)).toEqual({
      kind: 'move',
      move: { kind: 'place', cardIds: slotCards.cardIds, slot: 1 },
    });
    expect(resolveMove(slotCards, { kind: 'slot', slot: 0 }, filled).kind).toBe('none');
  });

  it('refuses a slot that cannot take them, and the discard pile', () => {
    const blocked = { ...filled, placed: [fours, [nine]] };

    expect(resolveMove(slotCards, { kind: 'slot', slot: 1 }, blocked).kind).toBe('refused');
    expect(resolveMove(slotCards, { kind: 'discard' }, filled)).toEqual({
      kind: 'refused',
      reason: MOVE_COPY.discardOne,
    });
  });

  it('ignores the drag when a card is missing or the player cannot act', () => {
    const missing = { ...slotCards, cardIds: [...slotCards.cardIds, 'gone'] };

    expect(resolveMove(missing, { kind: 'hand' }, filled).kind).toBe('none');
    expect(resolveMove(slotCards, { kind: 'hand' }, { ...filled, canAct: false }).kind).toBe(
      'none'
    );
  });
});
