import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { currentPlayer } from '@features/game-engine';

import { installDialogStubs } from '@ui/dialogStubs';

import { HINTS, MOVE_COPY, TURN_COPY } from '../constants';
import { makeGame, num, wild } from '../test/makeGame';
import { renderGame } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const status = () => screen.getByRole('status');
const click = (name: string | RegExp) => userEvent.click(screen.getByRole('button', { name }));
async function layDown() {
  const [first] = screen.getAllByRole('button', { name: TURN_COPY.layDownLabel(6) });
  expect(first).toBeDefined();
  if (first !== undefined) {
    await userEvent.click(first);
  }
}

describe('TurnPage with several cards selected', () => {
  it('lays the whole phase down from one drop on a slot', async () => {
    const hand = [num(9), num(4), num(9, 'blue'), num(4, 'green'), wild(), num(4, 'blue'), num(1)];
    const store = renderGame(makeGame(hand, { turnStep: 'play' }));

    for (const name of ['red 9', 'red 4', 'blue 9', 'green 4', 'Wild', 'blue 4']) {
      await click(name);
    }
    expect(status().textContent).toBe(HINTS.selectedMany(6));
    await layDown();

    const game = store.getState().game;
    const player = game && currentPlayer(game);
    expect(player?.laidGroups.map((g) => g.cards.length)).toEqual([3, 3]);
    expect(player?.hand).toHaveLength(1);
    expect(status().textContent).toBe(HINTS.playLaidDown);
  });

  it('fills one slot from several cards, and discards only one card at a time', async () => {
    renderGame(makeGame([num(4), num(4, 'blue'), wild(), num(1)], { turnStep: 'play' }));

    await click('red 4');
    await click('blue 4');
    await click('Wild');
    await click(TURN_COPY.discardOneAtATime);
    expect(status().textContent).toBe(MOVE_COPY.discardOne);
    await click(TURN_COPY.placeLabel('3 cards', 2, 'Set of 3'));

    expect(screen.getByText(TURN_COPY.slotProgress('Set of 3', 3, 3))).toBeTruthy();
  });

  it('adds several cards to a laid group at once', async () => {
    const phase = [
      num(4),
      num(4, 'green'),
      num(4, 'blue'),
      num(9),
      num(9, 'blue'),
      num(9, 'green'),
    ];
    const store = renderGame(
      makeGame([...phase, num(4, 'yellow'), wild(), num(1)], { turnStep: 'play' })
    );

    for (const name of ['red 4', 'green 4', 'blue 4', 'red 9', 'blue 9', 'green 9']) {
      await click(name);
    }
    await layDown();
    await click('yellow 4');
    await click('Wild');
    await click(/Add 2 cards to your set of 3 \(4s\)/);

    const game = store.getState().game;
    const fours = game && currentPlayer(game).laidGroups.find((g) => g.cards.length === 5);
    expect(fours).toBeDefined();
  });
});
