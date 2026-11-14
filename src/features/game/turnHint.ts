import type { Card, TurnStep } from '@features/game-engine';

import { HINTS } from './constants';

export type HintInput = {
  step: TurnStep;
  error: string | null;
  selected: readonly Card[];
  hasPlaced: boolean;
  hasLaidDown: boolean;
  topDiscard: Card | undefined;
  hasCardsToDraw: boolean;
  hasSkipTargets: boolean;
  pending: { skipTargetName: string | null } | null;
};

export function turnHint({
  step,
  error,
  selected,
  hasPlaced,
  hasLaidDown,
  topDiscard,
  hasCardsToDraw,
  hasSkipTargets,
  pending,
}: HintInput): string {
  if (pending !== null) {
    return pending.skipTargetName === null ? HINTS.done : HINTS.skipPlayed(pending.skipTargetName);
  }
  if (step === 'draw') {
    if (!hasCardsToDraw) {
      return HINTS.nothingToDraw;
    }
    return topDiscard?.kind === 'skip' ? HINTS.skipOnDiscard : HINTS.draw;
  }
  if (error !== null) {
    return error;
  }
  if (selected.length > 1) {
    return HINTS.selectedMany(selected.length);
  }
  if (selected[0]?.kind === 'skip') {
    return hasSkipTargets ? HINTS.selectedSkip : HINTS.discardSkipNoTarget;
  }
  if (selected.length === 1) {
    return HINTS.selected;
  }
  if (hasPlaced) {
    return HINTS.placing;
  }
  return hasLaidDown ? HINTS.playLaidDown : HINTS.play;
}
