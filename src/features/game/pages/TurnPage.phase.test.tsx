import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { currentPlayer, getPhase, validatePhase } from '@features/game-engine';

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

describe('TurnPage phases and hits', () => {
  it('keeps a Skip on the discard pile out of reach', () => {
    renderGame(makeGame([num(1)], { discardPile: [skip()] }));

    expect(button(/Take the top discard/)).toHaveProperty('disabled', true);
    expect(status().textContent).toBe(HINTS.skipOnDiscard);
  });

  it('shows why a phase is not valid', async () => {
    const hand = [num(4), num(9, 'blue'), num(1)];
    renderGame(makeGame(hand, { turnStep: 'play' }));
    const check = validatePhase(hand.slice(0, 2), getPhase(1));

    await userEvent.click(button(TURN_COPY.layDown));
    expect(status().textContent).toBe(HINTS.laying);
    await userEvent.click(button('red 4'));
    await userEvent.click(button('blue 9'));
    await userEvent.click(button(TURN_COPY.confirmPhase(2)));

    expect(check.ok ? '' : check.reason).not.toBe('');
    expect(status().textContent).toBe(check.ok ? '' : check.reason);
  });

  it('lays down a valid phase, then hits it', async () => {
    const hand = [num(4), num(4, 'green'), num(4, 'blue'), num(9), num(9, 'blue'), wild()];
    const extra = num(4, 'yellow');
    const store = renderGame(makeGame([...hand, extra], { turnStep: 'play' }));

    await userEvent.click(button(TURN_COPY.layDown));
    for (const name of ['red 4', 'green 4', 'blue 4', 'red 9', 'blue 9', 'Wild']) {
      await userEvent.click(button(name));
    }
    await userEvent.click(button(TURN_COPY.confirmPhase(6)));

    expect(button(TURN_COPY.layDown)).toHaveProperty('disabled', true);
    expect(status().textContent).toBe(HINTS.playLaidDown);

    await userEvent.click(button('yellow 4'));
    await userEvent.click(button('Add here: yellow 4 to your set of 3'));

    const game = store.getState().game;
    const groups = game === null ? [] : currentPlayer(game).laidGroups;
    expect(groups.map((group) => group.cards.length).sort((a, b) => a - b)).toEqual([3, 4]);
  });
});
