import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { installDialogStubs } from '@ui/dialogStubs';

import { HANDOFF_COPY, INTERIM_COPY } from '../constants';
import { makeGame, num } from '../test/makeGame';
import { renderGame, SETUP_STUB } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('GamePage', () => {
  it('sends you to setup when no game is in progress', () => {
    renderGame(null);

    expect(screen.getByRole('heading', { name: SETUP_STUB })).toBeTruthy();
  });

  it('shows the turn view', () => {
    renderGame(makeGame([]));

    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: 'Scoreboard' })).toBeTruthy();
  });

  it('hides the cards on handoff until the player reveals them', async () => {
    const store = renderGame(
      makeGame([num(4), num(9)], { view: 'handoff', lastAction: 'Cy discarded a green 11' })
    );

    expect(screen.getByRole('heading', { name: HANDOFF_COPY.title('Ana') })).toBeTruthy();
    expect(screen.getByText('Cy discarded a green 11 · Cards are hidden')).toBeTruthy();
    expect(screen.getByText('Phase 1 · 2 sets of 3 · 2 cards in hand')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /red 4/ })).toBeNull();
    expect(screen.getByRole('complementary', { name: 'Scoreboard' })).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: HANDOFF_COPY.reveal('Ana') }));

    expect(store.getState().game?.view).toBe('turn');
  });

  it('moves focus to the new heading when the device changes hands', async () => {
    renderGame(makeGame([num(4)], { view: 'handoff' }));

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
    await userEvent.click(screen.getByRole('button', { name: HANDOFF_COPY.reveal('Ana') }));

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'Ana' }));
  });

  it('opens the rules from the handoff screen', async () => {
    renderGame(makeGame([], { view: 'handoff' }));

    await userEvent.click(screen.getByRole('button', { name: 'Rules' }));

    expect(screen.getByRole('dialog', { name: 'Quick rules' })).toBeTruthy();
  });

  it('starts the next round from the round summary', async () => {
    const store = renderGame(makeGame([], { view: 'roundSummary', turnStep: 'done' }));

    await userEvent.click(screen.getByRole('button', { name: INTERIM_COPY.roundAction }));

    expect(store.getState().game?.round).toBe(2);
  });

  it('announces the winner and starts over', async () => {
    const store = renderGame(makeGame([], { view: 'gameOver', winnerId: 'p2' }));

    expect(screen.getByRole('heading', { name: INTERIM_COPY.gameOverTitle('Ben') })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: INTERIM_COPY.gameOverAction }));

    expect(store.getState().game).toBeNull();
  });
});
