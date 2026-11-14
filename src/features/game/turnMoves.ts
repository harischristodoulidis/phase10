import {
  canHit,
  fillSlots,
  orderHits,
  type Card,
  type DrawSource,
  type Group,
  type PhaseRequirement,
} from '@features/game-engine';

import { assertNever } from '@lib/assertNever';

import { cardName } from './cardView';
import { MOVE_COPY } from './constants';

export type DragItem =
  | { kind: 'handCard'; cardId: string }
  | { kind: 'handCards'; cardIds: readonly string[] }
  | { kind: 'placedCard'; cardId: string; slot: number }
  | { kind: 'slotCards'; slot: number; cardIds: readonly string[] }
  | { kind: 'deck' }
  | { kind: 'discardTop' };

export type DropZone =
  | { kind: 'hand' }
  | { kind: 'discard' }
  | { kind: 'slot'; slot: number }
  | { kind: 'group'; groupId: string };

export type TurnMove =
  | { kind: 'draw'; source: DrawSource }
  | { kind: 'discard'; cardId: string }
  | { kind: 'undoDiscard' }
  | { kind: 'place'; cardIds: readonly string[]; slot: number }
  | { kind: 'layDown'; slots: string[][] }
  | { kind: 'takeBack'; cardIds: readonly string[] }
  | { kind: 'hit'; cardIds: readonly string[]; groupId: string };

export type Resolution =
  | { kind: 'move'; move: TurnMove }
  | { kind: 'refused'; reason: string }
  | { kind: 'none' };

export type MoveContext = {
  canAct: boolean;
  canDrawDeck: boolean;
  canTakeDiscard: boolean;
  hasPendingDiscard: boolean;
  cards: readonly Card[];
  phase: PhaseRequirement;
  placed: readonly (readonly Card[])[];
  groups: readonly Group[];
  hasLaidDown: boolean;
};

const NONE: Resolution = { kind: 'none' };

function move(next: TurnMove): Resolution {
  return { kind: 'move', move: next };
}

function refuse(reason: string): Resolution {
  return { kind: 'refused', reason };
}

function placeCard(card: Card, zone: DropZone, ctx: MoveContext): Resolution {
  switch (zone.kind) {
    case 'hand':
      return NONE;
    case 'discard':
      return move({ kind: 'discard', cardId: card.id });
    case 'slot':
      return placeCards([card], zone, ctx);
    case 'group': {
      const group = ctx.groups.find((g) => g.id === zone.groupId);
      if (group === undefined) {
        return NONE;
      }
      if (!ctx.hasLaidDown) {
        return refuse(MOVE_COPY.layDownFirst);
      }
      return canHit(group, card)
        ? move({ kind: 'hit', cardIds: [card.id], groupId: group.id })
        : refuse(MOVE_COPY.cantHit(cardName(card)));
    }
    default:
      return assertNever(zone);
  }
}

function placeCards(cards: readonly Card[], zone: DropZone, ctx: MoveContext): Resolution {
  const cardIds = cards.map((card) => card.id);
  switch (zone.kind) {
    case 'hand':
      return NONE;
    case 'discard':
      return refuse(MOVE_COPY.discardOne);
    case 'slot': {
      if (ctx.hasLaidDown || ctx.phase.groups[zone.slot] === undefined) {
        return NONE;
      }
      if (cards.some((card) => card.kind === 'skip')) {
        return refuse(MOVE_COPY.skipInPhase);
      }
      const placed = ctx.placed.map((slot) => slot.filter((c) => !cardIds.includes(c.id)));
      const fill = fillSlots(placed, cards, zone.slot, ctx.phase);
      if (!fill.ok) {
        return refuse(fill.reason);
      }
      return fill.value.kind === 'slot'
        ? move({ kind: 'place', cardIds, slot: zone.slot })
        : move({ kind: 'layDown', slots: fill.value.slots.map((s) => s.map((c) => c.id)) });
    }
    case 'group': {
      const group = ctx.groups.find((g) => g.id === zone.groupId);
      if (group === undefined) {
        return NONE;
      }
      if (!ctx.hasLaidDown) {
        return refuse(MOVE_COPY.layDownFirst);
      }
      if (cards.some((card) => card.kind === 'skip')) {
        return refuse(MOVE_COPY.skipInGroup);
      }
      return orderHits(group, cards) === null
        ? refuse(MOVE_COPY.cantHitAll)
        : move({ kind: 'hit', cardIds, groupId: group.id });
    }
    default:
      return assertNever(zone);
  }
}

// The single place that decides what a drag or a tap does: both inputs go through here.
export function resolveMove(item: DragItem, zone: DropZone, ctx: MoveContext): Resolution {
  switch (item.kind) {
    case 'deck':
      return zone.kind === 'hand' && ctx.canDrawDeck
        ? move({ kind: 'draw', source: 'deck' })
        : NONE;
    case 'discardTop':
      if (zone.kind !== 'hand') {
        return NONE;
      }
      // The chosen discard isn't played until Next player, so it can still come back.
      if (ctx.hasPendingDiscard) {
        return move({ kind: 'undoDiscard' });
      }
      return ctx.canTakeDiscard ? move({ kind: 'draw', source: 'discard' }) : NONE;
    case 'handCard':
    case 'placedCard': {
      const card = ctx.cards.find((c) => c.id === item.cardId);
      if (card === undefined || !ctx.canAct) {
        return NONE;
      }
      if (item.kind === 'placedCard' && zone.kind === 'hand') {
        return move({ kind: 'takeBack', cardIds: [card.id] });
      }
      if (item.kind === 'placedCard' && zone.kind === 'slot' && zone.slot === item.slot) {
        return NONE;
      }
      return placeCard(card, zone, ctx);
    }
    case 'handCards':
    case 'slotCards': {
      const cards = item.cardIds.flatMap((id) => ctx.cards.find((c) => c.id === id) ?? []);
      if (cards.length !== item.cardIds.length || cards.length === 0 || !ctx.canAct) {
        return NONE;
      }
      if (item.kind === 'slotCards') {
        if (zone.kind === 'hand') {
          return move({ kind: 'takeBack', cardIds: item.cardIds });
        }
        if (zone.kind === 'slot' && zone.slot === item.slot) {
          return NONE;
        }
      }
      const [only] = cards;
      return cards.length === 1 && only !== undefined
        ? placeCard(only, zone, ctx)
        : placeCards(cards, zone, ctx);
    }
    default:
      return assertNever(item);
  }
}
