import { cleanup, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import type { Player } from '@features/game-engine';

import { installDialogStubs } from '@ui/dialogStubs';

import { ROUND_COPY } from '../constants';
import { goOut, makeGame, num, withPlayer } from '../test/makeGame';
import { renderGame } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('RoundSummaryPage', () => {
  it('shows the round results and deals the next round', async () => {
    const game = makeGame([num(5)], { dealerIndex: 2 });
    const store = renderGame(goOut(withPlayer(game, 'Ben', { hand: [num(4), num(11)] })));

    expect(screen.getByRole('heading', { level: 1, name: ROUND_COPY.title('Ana') })).toBeTruthy();
    expect(screen.getByText(ROUND_COPY.details('Ana', 2))).toBeTruthy();
    expect(screen.queryByText(/cards in draw pile/)).toBeNull();
    const ben = within(screen.getByRole('region', { name: ROUND_COPY.resultsTitle }))
      .getAllByRole('listitem')
      .at(1);
    expect(ben?.textContent).toContain(`${ROUND_COPY.points(15)}${ROUND_COPY.pointsLabel}`);
    expect(ben?.textContent).toContain(ROUND_COPY.repeats(1));

    await userEvent.click(screen.getByRole('button', { name: ROUND_COPY.action(2) }));

    expect(store.getState().game?.round).toBe(2);
  });

  it('announces a Phase 10 tie before the tiebreak', () => {
    const game = makeGame([num(5)]);
    const ana = withPlayer(game, 'Ana', { phase: 10, hasLaidDown: true, score: 100 });
    const ben = withPlayer(ana, 'Ben', { phase: 10, hasLaidDown: true, score: 95, hand: [num(1)] });
    renderGame(goOut(ben));

    expect(screen.getByRole('heading', { level: 1, name: ROUND_COPY.tieTitle })).toBeTruthy();
    expect(screen.getByText('Ana and Ben replay Phase 10 · Everyone else sits out')).toBeTruthy();
    expect(screen.getByRole('button', { name: ROUND_COPY.tieAction })).toBeTruthy();
  });

  it('leaves out the sit-out line when every player ties', () => {
    const game = makeGame([num(5)]);
    const tied: Partial<Player> = { phase: 10, hasLaidDown: true, score: 95, hand: [num(1)] };
    const ana = withPlayer(game, 'Ana', { phase: 10, hasLaidDown: true, score: 100 });
    renderGame(goOut(withPlayer(withPlayer(ana, 'Ben', tied), 'Cy', { ...tied, hand: [num(2)] })));

    expect(screen.getByText('Ana, Ben and Cy replay Phase 10')).toBeTruthy();
  });
});
