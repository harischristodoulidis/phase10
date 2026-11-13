import { useState } from 'react';

import { useAppDispatch } from '@app/hooks';
import {
  canDraw,
  currentPlayer,
  getPhase,
  skipTargets,
  validatePhase,
  type Card,
  type DrawSource,
  type GameState,
  type Player,
} from '@features/game-engine';

import { cardDiscarded, cardDrawn, cardHit, phaseLaidDown } from '../gameSlice';
import { turnHint, type TurnMode } from '../turnHint';
import { nextPlayerId } from '../turnInfo';

export type TurnDialog = 'rules' | 'reset' | 'skip' | null;

type PendingDiscard = { cardId: string; skipTarget: Player | null };

export type TurnState = {
  player: Player;
  hand: Card[];
  selected: Card[];
  selectedIds: readonly string[];
  pendingCard: Card | undefined;
  hitCard: Card | undefined;
  nextUpId: string | null;
  mode: TurnMode;
  hint: string;
  dialog: TurnDialog;
  canAct: boolean;
  isDone: boolean;
  canDrawDeck: boolean;
  canTakeDiscard: boolean;
  draw: (source: DrawSource) => void;
  toggleCard: (cardId: string) => void;
  startLaying: () => void;
  cancelLaying: () => void;
  confirmPhase: () => void;
  discardSelected: (skipTarget?: Player | null) => void;
  hitGroup: (groupId: string) => void;
  nextPlayer: () => void;
  openDialog: (dialog: TurnDialog) => void;
  closeDialog: () => void;
};

// The engine hands over to the next player as soon as a card is discarded, so the
// chosen discard waits here until the player presses Next player.
export function useTurnState(game: GameState): TurnState {
  const dispatch = useAppDispatch();
  const player = currentPlayer(game);
  const [mode, setMode] = useState<TurnMode>('play');
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [layError, setLayError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDiscard | null>(null);
  const [dialog, setDialog] = useState<TurnDialog>(null);

  const hand = player.hand.filter((card) => card.id !== pending?.cardId);
  const selected = hand.filter((card) => selectedIds.includes(card.id));
  const canAct = game.turnStep === 'play' && pending === null;
  const isDrawStep = game.turnStep === 'draw';
  const hasCardsToDraw = canDraw(game);
  const topDiscard = game.discardPile.at(-1);
  const hasSkipTargets = skipTargets(game).length > 0;
  const deckEmpty = game.drawPile.length === 0 && game.discardPile.length <= 1;

  function toggleCard(cardId: string) {
    if (!canAct) {
      return;
    }
    setLayError(null);
    const isSelected = selectedIds.includes(cardId);
    if (mode === 'laying') {
      setSelectedIds(
        isSelected ? selectedIds.filter((id) => id !== cardId) : [...selectedIds, cardId]
      );
    } else {
      setSelectedIds(isSelected ? [] : [cardId]);
    }
  }

  function setLaying(isLaying: boolean) {
    setMode(isLaying ? 'laying' : 'play');
    setSelectedIds([]);
    setLayError(null);
  }

  function confirmPhase() {
    const result = validatePhase(selected, getPhase(player.phase));
    if (!result.ok) {
      setLayError(result.reason);
      return;
    }
    dispatch(phaseLaidDown(selected.map((card) => card.id)));
    setLaying(false);
  }

  function discardSelected(skipTarget: Player | null = null) {
    const [card] = selected;
    if (card === undefined) {
      return;
    }
    if (card.kind === 'skip' && skipTarget === null && hasSkipTargets) {
      setDialog('skip');
      return;
    }
    setPending({ cardId: card.id, skipTarget });
    setSelectedIds([]);
    setDialog(null);
  }

  function hitGroup(groupId: string) {
    const [card] = selected;
    if (card !== undefined) {
      dispatch(cardHit({ cardId: card.id, groupId }));
      setSelectedIds([]);
    }
  }

  function nextPlayer() {
    if (pending !== null) {
      dispatch(cardDiscarded({ cardId: pending.cardId, skipTargetId: pending.skipTarget?.id }));
    }
  }

  return {
    player,
    hand,
    selected,
    selectedIds,
    pendingCard: player.hand.find((card) => card.id === pending?.cardId),
    hitCard: canAct && mode === 'play' && player.hasLaidDown ? selected.at(0) : undefined,
    // Discarding the last card ends the round, so nobody is next.
    nextUpId:
      pending !== null && hand.length === 0
        ? null
        : nextPlayerId(game, pending?.skipTarget?.id ?? null),
    mode,
    hint: turnHint({
      step: game.turnStep,
      mode,
      layError,
      selected,
      hasLaidDown: player.hasLaidDown,
      topDiscard,
      hasCardsToDraw,
      hasSkipTargets,
      pending: pending === null ? null : { skipTargetName: pending.skipTarget?.name ?? null },
    }),
    dialog,
    canAct,
    isDone: pending !== null,
    // With nothing to draw anywhere, the draw pile lets the player carry on without a card.
    canDrawDeck: isDrawStep && (!deckEmpty || !hasCardsToDraw),
    canTakeDiscard: isDrawStep && topDiscard !== undefined && topDiscard.kind !== 'skip',
    draw: (source) => dispatch(cardDrawn(source)),
    toggleCard,
    startLaying: () => setLaying(true),
    cancelLaying: () => setLaying(false),
    confirmPhase,
    discardSelected,
    hitGroup,
    nextPlayer,
    openDialog: setDialog,
    closeDialog: () => setDialog(null),
  };
}
