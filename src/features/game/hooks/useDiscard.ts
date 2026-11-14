import { useState } from 'react';

import { useAppDispatch } from '@app/hooks';
import {
  currentPlayer,
  skipTargets,
  type Card,
  type GameState,
  type Player,
} from '@features/game-engine';

import { cardDiscarded } from '../gameSlice';

type PendingDiscard = { cardId: string; skipTarget: Player | null };

export type Discard = {
  pending: PendingDiscard | null;
  pendingCard: Card | undefined;
  hintPending: { skipTargetName: string | null } | null;
  isPickingSkipTarget: boolean;
  choose: (cardId: string) => void;
  undo: () => void;
  pickSkipTarget: (target: Player) => void;
  cancelSkipTarget: () => void;
  commit: () => void;
};

// The engine ends the turn on discard, so the chosen card waits here until Next player.
export function useDiscard(game: GameState): Discard {
  const dispatch = useAppDispatch();
  const player = currentPlayer(game);
  const [pending, setPending] = useState<PendingDiscard | null>(null);
  const [skipCardId, setSkipCardId] = useState<string | null>(null);

  function choose(cardId: string) {
    const card = player.hand.find((c) => c.id === cardId);
    if (card?.kind === 'skip' && skipTargets(game).length > 0) {
      setSkipCardId(cardId);
      return;
    }
    setPending({ cardId, skipTarget: null });
  }

  return {
    pending,
    pendingCard: player.hand.find((card) => card.id === pending?.cardId),
    hintPending: pending === null ? null : { skipTargetName: pending.skipTarget?.name ?? null },
    isPickingSkipTarget: skipCardId !== null,
    choose,
    undo: () => setPending(null),
    pickSkipTarget: (target) => {
      if (skipCardId !== null) {
        setPending({ cardId: skipCardId, skipTarget: target });
        setSkipCardId(null);
      }
    },
    cancelSkipTarget: () => setSkipCardId(null),
    commit: () => {
      if (pending !== null) {
        dispatch(cardDiscarded({ cardId: pending.cardId, skipTargetId: pending.skipTarget?.id }));
      }
    },
  };
}
