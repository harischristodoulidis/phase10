import { cleanup, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { installDialogStubs } from '@ui/dialogStubs';

import { GAME_OVER_COPY } from '../constants';
import { goOut, makeGame, num, withPlayer } from '../test/makeGame';
import { renderGame, SETUP_STUB } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Ana and Ben both finish Phase 10; Ben ends on the lower total.
function finishedGame() {
  const game = makeGame([num(5)], { round: 9 });
  const ana = withPlayer(game, 'Ana', { phase: 10, hasLaidDown: true, score: 90 });
  const ben = withPlayer(ana, 'Ben', { phase: 10, hasLaidDown: true, score: 40, hand: [num(1)] });
  return goOut(withPlayer(ben, 'Cy', { phase: 7, score: 20, hand: [num(11)] }));
}

// Ana and Ben tied on Phase 10; Ana goes out first in the tiebreak while Cy sits out.
function tiebreakGame() {
  const game = makeGame([num(5)], { round: 10, isTiebreak: true });
  const ana = withPlayer(game, 'Ana', { phase: 10, score: 50 });
  const ben = withPlayer(ana, 'Ben', { phase: 10, score: 50, hand: [num(1)] });
  const tied = withPlayer(ben, 'Cy', { phase: 8, score: 30, hand: [], isSittingOut: true });
  const finisherIds = tied.players.filter((p) => p.phase === 10).map((p) => p.id);
  return goOut({ ...tied, finisherIds });
}

describe('GameOverPage', () => {
  it('names the winner, why they won and the final standings', () => {
    renderGame(finishedGame());

    expect(
      screen.getByRole('heading', { level: 1, name: GAME_OVER_COPY.title('Ben') })
    ).toBeTruthy();
    expect(focusedHeading()).toBe(true);
    expect(screen.getByText(GAME_OVER_COPY.status(9))).toBeTruthy();
    expect(screen.getByText(GAME_OVER_COPY.reasons.lowestTotal)).toBeTruthy();
    expect(screen.queryByText(/cards in draw pile/)).toBeNull();
    const rows = within(screen.getByRole('region', { name: GAME_OVER_COPY.standingsTitle }))
      .getAllByRole('listitem')
      .map((row) => row.textContent);
    expect(rows).toEqual([
      `Ben${GAME_OVER_COPY.winner}${GAME_OVER_COPY.finished}45${GAME_OVER_COPY.points}`,
      `Ana${GAME_OVER_COPY.finished}90${GAME_OVER_COPY.points}`,
      `Cy${GAME_OVER_COPY.reached(7)}30${GAME_OVER_COPY.points}`,
    ]);
  });

  it('highlights the winner on the scoreboard', () => {
    renderGame(finishedGame());

    const rows = within(screen.getByRole('complementary')).getAllByRole('listitem');
    expect(rows.map((row) => row.getAttribute('aria-current'))).toEqual([null, 'true', null]);
  });

  it('explains a tiebreak win', () => {
    renderGame(tiebreakGame());

    expect(
      screen.getByRole('heading', { level: 1, name: GAME_OVER_COPY.title('Ana') })
    ).toBeTruthy();
    expect(screen.getByText(GAME_OVER_COPY.reasons.tiebreak)).toBeTruthy();
  });

  it('starts a new game from setup', async () => {
    const store = renderGame(finishedGame());

    await userEvent.click(screen.getByRole('button', { name: GAME_OVER_COPY.action }));

    expect(store.getState().game).toBeNull();
    expect(screen.getByRole('heading', { name: SETUP_STUB })).toBeTruthy();
  });
});

function focusedHeading(): boolean {
  return document.activeElement === screen.getByRole('heading', { level: 1 });
}
