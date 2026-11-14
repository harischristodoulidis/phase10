import { useState } from 'react';

import { getPhase, type Card, type GroupRequirement, type Player } from '@features/game-engine';

export type Placement = {
  slots: readonly GroupRequirement[];
  placed: Card[][];
  placedIds: string[];
  place: (cardIds: readonly string[], slot: number) => string[][];
  remove: (cardIds: readonly string[]) => void;
};

// Placed cards stay in the hand until the phase goes down, which then empties the slots.
export function usePlacement(player: Player): Placement {
  const [ids, setIds] = useState<readonly (readonly string[])[]>([]);
  const slots = getPhase(player.phase).groups;
  const lists = slots.map((_, i) =>
    (ids[i] ?? []).filter((id) => player.hand.some((card) => card.id === id))
  );

  function place(cardIds: readonly string[], slot: number): string[][] {
    const next = lists.map((list, i) => {
      const rest = list.filter((id) => !cardIds.includes(id));
      return i === slot ? [...rest, ...cardIds] : rest;
    });
    setIds(next);
    return next;
  }

  return {
    slots,
    placed: lists.map((list) => list.flatMap((id) => player.hand.find((c) => c.id === id) ?? [])),
    placedIds: lists.flat(),
    place,
    remove: (cardIds) => setIds(lists.map((list) => list.filter((id) => !cardIds.includes(id)))),
  };
}
