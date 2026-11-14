import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { SCOREBOARD_COPY } from '../constants';
import type { ScoreboardPlayer } from '../types';
import { Scoreboard } from './Scoreboard';

afterEach(cleanup);

const PLAYERS: ScoreboardPlayer[] = [
  { id: 'p1', name: 'Ana', color: 'red', phase: 3, score: 25 },
  { id: 'p2', name: 'Ben', color: 'blue', phase: 2, score: 40 },
  { id: 'p3', name: 'Cleo', color: 'green', phase: 3, score: 10 },
];

function renderBoard(nextPlayerId: string | null = 'p2') {
  render(<Scoreboard players={PLAYERS} currentPlayerId="p1" nextPlayerId={nextPlayerId} />);
}

describe('Scoreboard', () => {
  it('is a labelled aside with one row per player in seat order', () => {
    renderBoard();

    const board = screen.getByRole('complementary', { name: SCOREBOARD_COPY.title });
    const rows = within(board).getAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      'AnaPhase 325 points',
      'BenPhase 240 points',
      'CleoPhase 310 points',
    ]);
  });

  it('marks only the current player', () => {
    renderBoard();

    const rows = screen.getAllByRole('listitem');
    expect(rows.map((row) => row.getAttribute('aria-current'))).toEqual(['true', null, null]);
  });

  it('shows the current player’s phase progress and who is next', () => {
    renderBoard();

    expect(screen.getByRole('img', { name: 'Ana is on phase 3 of 10' })).toBeTruthy();
    expect(screen.getByText(SCOREBOARD_COPY.nextUp('Ben'))).toBeTruthy();
  });

  it('hides "next up" when there is no next player', () => {
    renderBoard(null);

    expect(screen.queryByText(/Next up/)).toBeNull();
  });
});
