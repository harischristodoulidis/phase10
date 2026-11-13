import { cleanup, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { installDialogStubs } from '@ui/dialogStubs';

import { HINTS, RESET_COPY, SKIP_COPY, TURN_COPY } from '../constants';
import { makeGame, num, skip } from '../test/makeGame';
import { renderGame, SETUP_STUB } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const status = () => screen.getByRole('status');

describe('TurnPage', () => {
  it('shows the player, the round and the hand', () => {
    renderGame(makeGame([num(4), num(9, 'blue')]));

    expect(screen.getByRole('heading', { level: 1, name: 'Ana' })).toBeTruthy();
    expect(screen.getByText(TURN_COPY.round(1))).toBeTruthy();
    expect(screen.getByRole('list', { name: TURN_COPY.hand(2) })).toBeTruthy();
    expect(status().textContent).toBe(HINTS.draw);
  });

  it('draws, discards and hands over on Next player', async () => {
    const store = renderGame(makeGame([num(4), num(9, 'blue')]));
    const nextPlayer = screen.getByRole('button', { name: TURN_COPY.nextPlayer });

    await userEvent.click(screen.getByRole('button', { name: /Take the top discard/ }));
    expect(screen.getByRole('list', { name: TURN_COPY.hand(3) })).toBeTruthy();
    expect(status().textContent).toBe(HINTS.play);

    await userEvent.click(screen.getByRole('button', { name: 'blue 9' }));
    expect(
      screen.getByRole('button', { name: 'blue 9, selected' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(nextPlayer).toHaveProperty('disabled', true);

    await userEvent.click(screen.getByRole('button', { name: TURN_COPY.discard }));
    expect(status().textContent).toBe(HINTS.done);
    const hand = screen.getByRole('list', { name: TURN_COPY.hand(2) });
    expect(within(hand).queryByRole('button', { name: /blue 9/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Take the top discard: blue 9/ })).toBeTruthy();

    await userEvent.click(nextPlayer);
    expect(store.getState().game?.view).toBe('handoff');
    expect(screen.getByRole('heading', { name: 'Pass to Ben' })).toBeTruthy();
  });

  it('asks who a Skip goes against', async () => {
    const card = skip();
    const store = renderGame(makeGame([card, num(2)], { turnStep: 'play' }));

    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
    await userEvent.click(screen.getByRole('button', { name: TURN_COPY.discard }));
    const dialog = screen.getByRole('dialog', { name: SKIP_COPY.title });
    await userEvent.click(within(dialog).getByRole('button', { name: /Ben/ }));

    expect(status().textContent).toBe(HINTS.skipPlayed('Ben'));

    await userEvent.click(screen.getByRole('button', { name: TURN_COPY.nextPlayer }));
    const ben = store.getState().game?.players.find((p) => p.name === 'Ben');
    expect(ben?.wasSkippedThisRound).toBe(true);
  });

  it('resets the game after confirming', async () => {
    const store = renderGame(makeGame([num(1)]));

    await userEvent.click(screen.getByRole('button', { name: TURN_COPY.reset }));
    const dialog = screen.getByRole('alertdialog', { name: RESET_COPY.title });
    await userEvent.click(within(dialog).getByRole('button', { name: RESET_COPY.confirm }));

    expect(store.getState().game).toBeNull();
    expect(screen.getByRole('heading', { name: SETUP_STUB })).toBeTruthy();
  });
});
