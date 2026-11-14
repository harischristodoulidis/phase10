import { cleanup, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { installDialogStubs } from '@ui/dialogStubs';

import { HINTS, SKIP_COPY, TURN_COPY } from '../constants';
import { makeGame, num, setOf, skip, withPlayer } from '../test/makeGame';
import { renderGame } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const status = () => screen.getByRole('status');
const click = (name: string | RegExp) => userEvent.click(screen.getByRole('button', { name }));

describe('TurnPage rules', () => {
  it('only offers players who can still be skipped, and updates who is next', async () => {
    const game = withPlayer(makeGame([skip(), num(2)], { turnStep: 'play' }), 'Ben', {
      wasSkippedThisRound: true,
    });
    renderGame(game);

    await click('Skip');
    await click(TURN_COPY.discardLabel('Skip'));
    const dialog = screen.getByRole('dialog', { name: SKIP_COPY.title });
    const ben = within(dialog).getByRole('button', { name: /Ben/ });
    expect(ben).toHaveProperty('disabled', true);
    expect(ben.textContent).toContain(SKIP_COPY.used);

    await userEvent.click(within(dialog).getByRole('button', { name: /Cy/ }));
    expect(screen.getByText(/Next up: Ben/)).toBeTruthy();
  });

  it('plays a Skip with no effect once everyone has been skipped', async () => {
    let game = makeGame([skip(), num(2)], { turnStep: 'play' });
    game = withPlayer(withPlayer(game, 'Ben', { wasSkippedThisRound: true }), 'Cy', {
      wasSkippedThisRound: true,
    });
    renderGame(game);

    await click('Skip');
    expect(status().textContent).toBe(HINTS.discardSkipNoTarget);
    await click(TURN_COPY.discardLabel('Skip'));

    expect(screen.queryByRole('dialog', { name: SKIP_COPY.title })).toBeNull();
    expect(status().textContent).toBe(HINTS.done);
  });

  it('ends the round when the last card is discarded', async () => {
    const store = renderGame(makeGame([num(1)], { turnStep: 'play' }));

    await click('red 1');
    await click(TURN_COPY.discardLabel('red 1'));
    expect(screen.queryByText(/Next up/)).toBeNull();
    await click(TURN_COPY.nextPlayer);

    expect(store.getState().game?.view).toBe('roundSummary');
  });

  it('offers no hits before the phase is laid down', async () => {
    const game = withPlayer(makeGame([num(4, 'blue'), num(1)], { turnStep: 'play' }), 'Ben', {
      hasLaidDown: true,
      laidGroups: [setOf(4, 'p2-g1')],
    });
    renderGame(game);

    await click('blue 4');

    expect(screen.queryByRole('button', { name: /Add blue 4/ })).toBeNull();
  });

  it('hits another player’s group', async () => {
    let game = makeGame([num(4, 'blue'), num(1)], { turnStep: 'play' });
    game = withPlayer(game, 'Ana', { hasLaidDown: true, laidGroups: [setOf(9, 'p1-g1')] });
    game = withPlayer(game, 'Ben', { hasLaidDown: true, laidGroups: [setOf(4, 'p2-g1')] });
    const store = renderGame(game);

    await click('blue 4');
    await click('Add blue 4 to Ben’s set of 3 (4s)');

    expect(store.getState().game?.players[1]?.laidGroups[0]?.cards).toHaveLength(4);
  });
});
