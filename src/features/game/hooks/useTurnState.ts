import { useState } from 'react';

import { useAppDispatch } from '@app/hooks';
import {
  canDraw,
  currentPlayer,
  getPhase,
  skipTargets,
  validateSlots,
  type Card,
  type DrawSource,
  type GameState,
  type GroupRequirement,
  type Player,
} from '@features/game-engine';

import { assertNever } from '@lib/assertNever';

import { cardDrawn, cardHit, handArranged, phaseLaidDown } from '../gameSlice';
import { turnHint } from '../turnHint';
import { nextPlayerId } from '../turnInfo';
import {
  resolveMove,
  type DragItem,
  type DropZone,
  type MoveContext,
  type Resolution,
  type TurnMove,
} from '../turnMoves';
import { useDiscard } from './useDiscard';
import { usePlacement } from './usePlacement';

export type TurnState = {
  player: Player;
  hand: Card[];
  selected: Card[];
  selection: DragItem | null;
  slots: readonly GroupRequirement[];
  placed: Card[][];
  pendingCard: Card | undefined;
  nextUpId: string | null;
  hint: string;
  isPickingSkipTarget: boolean;
  canAct: boolean;
  canArrange: boolean;
  isDone: boolean;
  canDrawDeck: boolean;
  canTakeDiscard: boolean;
  dragItemFor: (cardId: string) => DragItem;
  slotItem: (slot: number, cardId: string) => DragItem;
  cardsOf: (item: DragItem | null) => Card[];
  resolve: (item: DragItem, zone: DropZone) => Resolution;
  drop: (item: DragItem, zone: DropZone) => void;
  tapZone: (zone: DropZone) => void;
  draw: (source: DrawSource) => void;
  undoDiscard: () => void;
  toggleCard: (cardId: string) => void;
  arrangeHand: (cardIds: readonly string[]) => void;
  pickSkipTarget: (target: Player) => void;
  nextPlayer: () => void;
  cancelSkipTarget: () => void;
};

function itemOfCards(cards: readonly Card[]): DragItem | null {
  const [only] = cards;
  if (only === undefined) {
    return null;
  }
  return cards.length === 1
    ? { kind: 'handCard', cardId: only.id }
    : { kind: 'handCards', cardIds: cards.map((card) => card.id) };
}

// Dragging one of several selected cards carries the whole selection.
function dragItemFor(selection: DragItem | null, cardId: string): DragItem {
  return selection?.kind === 'handCards' && selection.cardIds.includes(cardId)
    ? selection
    : { kind: 'handCard', cardId };
}

// Dragging any card in a slot carries the whole slot.
function slotItem(placed: readonly (readonly Card[])[], slot: number, cardId: string): DragItem {
  const cards = placed[slot] ?? [];
  return cards.length > 1
    ? { kind: 'slotCards', slot, cardIds: cards.map((card) => card.id) }
    : { kind: 'placedCard', cardId, slot };
}

function cardsOf(item: DragItem | null, selected: Card[], placed: readonly Card[][]): Card[] {
  if (item?.kind === 'handCards') {
    return selected;
  }
  if (item?.kind !== 'slotCards') {
    return [];
  }
  const all = placed.flat();
  return item.cardIds.flatMap((id) => all.find((card) => card.id === id) ?? []);
}

export function useTurnState(game: GameState): TurnState {
  const dispatch = useAppDispatch();
  const player = currentPlayer(game);
  const placement = usePlacement(player);
  const discard = useDiscard(game);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cards = player.hand.filter((card) => card.id !== discard.pending?.cardId);
  const hand = cards.filter((card) => !placement.placedIds.includes(card.id));
  const selected = hand.filter((card) => selectedIds.includes(card.id));
  const selection = itemOfCards(selected);
  const canAct = game.turnStep === 'play' && discard.pending === null;
  const isDrawStep = game.turnStep === 'draw';
  const hasCardsToDraw = canDraw(game);
  const topDiscard = game.discardPile.at(-1);
  const deckEmpty = game.drawPile.length === 0 && game.discardPile.length <= 1;
  const ctx: MoveContext = {
    canAct,
    // With nothing to draw anywhere, the draw pile lets the player carry on without a card.
    canDrawDeck: isDrawStep && (!deckEmpty || !hasCardsToDraw),
    canTakeDiscard: isDrawStep && topDiscard !== undefined && topDiscard.kind !== 'skip',
    hasPendingDiscard: discard.pending !== null,
    cards,
    phase: getPhase(player.phase),
    placed: placement.placed,
    groups: game.players.flatMap((p) => p.laidGroups),
    hasLaidDown: player.hasLaidDown,
  };

  function place(cardIds: readonly string[], slot: number) {
    const next = placement.place(cardIds, slot);
    const isFull = next.every((ids, i) => ids.length === placement.slots[i]?.size);
    if (!isFull) {
      return;
    }
    const slotCards = next.map((ids) => ids.flatMap((id) => cards.find((c) => c.id === id) ?? []));
    const result = validateSlots(slotCards, ctx.phase);
    if (result.ok) {
      dispatch(phaseLaidDown(next));
    } else {
      setError(result.reason);
    }
  }

  function apply(move: TurnMove) {
    setSelectedIds([]);
    setError(null);
    switch (move.kind) {
      case 'draw':
        return dispatch(cardDrawn(move.source));
      case 'discard':
        placement.remove([move.cardId]);
        return discard.choose(move.cardId);
      case 'undoDiscard':
        return discard.undo();
      case 'place':
        return place(move.cardIds, move.slot);
      case 'layDown':
        return dispatch(phaseLaidDown(move.slots));
      case 'takeBack':
        return placement.remove(move.cardIds);
      case 'hit':
        return dispatch(cardHit({ cardIds: [...move.cardIds], groupId: move.groupId }));
      default:
        return assertNever(move);
    }
  }

  function drop(item: DragItem, zone: DropZone) {
    const result = resolveMove(item, zone, ctx);
    if (result.kind === 'move') {
      apply(result.move);
    } else {
      setError(result.kind === 'refused' ? result.reason : null);
    }
  }

  return {
    player,
    hand,
    selected,
    selection,
    slots: placement.slots,
    placed: placement.placed,
    pendingCard: discard.pendingCard,
    // Discarding the last card ends the round, so nobody is next.
    nextUpId:
      discard.pending !== null && cards.length === 0
        ? null
        : nextPlayerId(game, discard.pending?.skipTarget?.id ?? null),
    hint: turnHint({
      step: game.turnStep,
      error,
      selected,
      hasPlaced: placement.placedIds.length > 0,
      hasLaidDown: player.hasLaidDown,
      topDiscard,
      hasCardsToDraw,
      hasSkipTargets: skipTargets(game).length > 0,
      pending: discard.hintPending,
    }),
    isPickingSkipTarget: discard.isPickingSkipTarget,
    canAct,
    canArrange: game.view === 'turn' && discard.pending === null,
    isDone: discard.pending !== null,
    canDrawDeck: ctx.canDrawDeck,
    canTakeDiscard: ctx.canTakeDiscard,
    dragItemFor: (cardId) => dragItemFor(selection, cardId),
    slotItem: (slot, cardId) => slotItem(placement.placed, slot, cardId),
    cardsOf: (item) => cardsOf(item, selected, placement.placed),
    resolve: (item, zone) => resolveMove(item, zone, ctx),
    drop,
    tapZone: (zone) => {
      if (selection !== null) {
        drop(selection, zone);
      }
    },
    draw: (source) => drop({ kind: source === 'deck' ? 'deck' : 'discardTop' }, { kind: 'hand' }),
    undoDiscard: () => drop({ kind: 'discardTop' }, { kind: 'hand' }),
    toggleCard: (cardId) => {
      if (canAct) {
        setError(null);
        setSelectedIds((ids) =>
          ids.includes(cardId) ? ids.filter((id) => id !== cardId) : [...ids, cardId]
        );
      }
    },
    arrangeHand: (cardIds) =>
      dispatch(handArranged([...cardIds, ...placement.placedIds, ...pendingIds(discard.pending)])),
    pickSkipTarget: discard.pickSkipTarget,
    nextPlayer: discard.commit,
    cancelSkipTarget: discard.cancelSkipTarget,
  };
}

function pendingIds(pending: { cardId: string } | null): string[] {
  return pending === null ? [] : [pending.cardId];
}
