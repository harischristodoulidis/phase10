import type { Card, TurnStep } from '@features/game-engine';

import { HINTS } from './constants';

export type TurnMode = 'play' | 'laying';

export type HintInput = {
  step: TurnStep;
  mode: TurnMode;
  layError: string | null;
  selected: readonly Card[];
  hasLaidDown: boolean;
  topDiscard: Card | undefined;
  hasCardsToDraw: boolean;
  hasSkipTargets: boolean;
  pending: { skipTargetName: string | null } | null;
};

export function turnHint({
  step,
  mode,
  layError,
  selected,
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
  if (mode === 'laying') {
    return layError ?? HINTS.laying;
  }
  const [card] = selected;
  if (card === undefined) {
    return hasLaidDown ? HINTS.playLaidDown : HINTS.play;
  }
  if (card.kind === 'skip') {
    return hasSkipTargets ? HINTS.discardSkip : HINTS.discardSkipNoTarget;
  }
  return HINTS.discardSelected;
}
