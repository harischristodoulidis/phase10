import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { currentPlayer } from '@features/game-engine';

import { installDialogStubs } from '@ui/dialogStubs';

import { HINTS, TURN_COPY } from '../constants';
import { makeGame, num, skip, wild } from '../test/makeGame';
import { renderGame } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const status = () => screen.getByRole('status');
const button = (name: string | RegExp) => screen.getByRole('button', { name });
const click = (name: string | RegExp) => userEvent.click(button(name));

const NEEDS_3 = 'This slot needs exactly 3 cards — select them all, then drop them together.';

async function place(cards: string[], slot: number) {
  for (const card of cards) {
    await click(card);
  }
  const name = cards.length === 1 ? (cards[0] ?? '') : `${cards.length} cards`;
  await click(TURN_COPY.placeLabel(name, slot, 'Set of 3'));
}

describe('TurnPage phases and hits', () => {
  it('keeps a Skip on the discard pile out of reach', () => {
    renderGame(makeGame([num(1)], { discardPile: [skip()] }));

    expect(button(`${TURN_COPY.discardPile}: Skip`).getAttribute('aria-disabled')).toBe('true');
    expect(status().textContent).toBe(HINTS.skipOnDiscard);
  });

  it('refuses fewer cards than the slot needs, and says why', async () => {
    renderGame(makeGame([num(4), num(4, 'blue'), num(1)], { turnStep: 'play' }));

    await place(['red 4'], 1);
    expect(status().textContent).toBe(NEEDS_3);
    expect(button('red 4, selected')).toBeTruthy();
    await click('blue 4');
    await click(TURN_COPY.placeLabel('2 cards', 1, 'Set of 3'));

    expect(status().textContent).toBe(NEEDS_3);
    expect(screen.queryByRole('button', { name: /^Return/ })).toBeNull();
  });

  it('sends a placed card back to the hand', async () => {
    renderGame(makeGame([num(4), num(4, 'blue'), num(4, 'green'), num(1)], { turnStep: 'play' }));

    await place(['red 4', 'blue 4', 'green 4'], 2);
    expect(status().textContent).toBe(HINTS.placing);
    expect(screen.queryByRole('button', { name: 'red 4' })).toBeNull();
    await click(TURN_COPY.returnLabel('red 4'));

    expect(button('red 4')).toBeTruthy();
    expect(screen.getByText(TURN_COPY.slotProgress('Set of 3', 2, 3))).toBeTruthy();
    expect(screen.queryByRole('button', { name: TURN_COPY.returnLabel('red 4') })).toBeNull();

    await place(['red 4'], 2);
    expect(screen.getByText(TURN_COPY.slotProgress('Set of 3', 3, 3))).toBeTruthy();
  });

  it('lays the phase down as soon as every slot is complete, then hits it', async () => {
    const hand = [num(4), num(4, 'green'), num(4, 'blue'), num(9), num(9, 'blue'), wild()];
    const extra = num(4, 'yellow');
    const store = renderGame(makeGame([...hand, extra], { turnStep: 'play' }));

    await place(['red 4', 'green 4', 'blue 4'], 1);
    await place(['red 9', 'blue 9', 'Wild'], 2);

    const laid = store.getState().game;
    expect(laid && currentPlayer(laid).laidGroups.map((g) => g.cards.length)).toEqual([3, 3]);
    expect(status().textContent).toBe(HINTS.playLaidDown);

    await click('yellow 4');
    expect(
      screen.queryByRole('button', { name: /Add yellow 4 to your set of 3 \(9s\)/ })
    ).toBeNull();
    await click('Add yellow 4 to your set of 3 (4s)');

    const game = store.getState().game;
    expect(game && currentPlayer(game).laidGroups[0]?.cards).toHaveLength(4);
  });
});
