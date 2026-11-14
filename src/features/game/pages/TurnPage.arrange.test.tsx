import { cleanup, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { currentPlayer } from '@features/game-engine';

import { installDialogStubs } from '@ui/dialogStubs';

import { TURN_COPY } from '../constants';
import { makeGame, num } from '../test/makeGame';
import { renderGame } from '../test/renderGame';

beforeEach(installDialogStubs);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const cardNames = (count: number) =>
  within(screen.getByRole('list', { name: TURN_COPY.hand(count) }))
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label'));

describe('TurnPage hand arranging', () => {
  it('moves a card with Alt and the arrow keys before drawing', async () => {
    const hand = [num(1), num(2), num(3)];
    const store = renderGame(makeGame(hand));
    const first = screen.getByRole('button', { name: 'red 1' });

    first.focus();
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(cardNames(3)).toEqual(['red 2', 'red 1', 'red 3']);
    const game = store.getState().game;
    expect(game && currentPlayer(game).hand.map((card) => card.id)).toEqual([
      hand[1].id,
      hand[0].id,
      hand[2].id,
    ]);
    expect(game?.turnStep).toBe('draw');
  });

  it('keeps focus on the moved card so it can move again', async () => {
    renderGame(makeGame([num(1), num(2), num(3)]));
    const first = screen.getByRole('button', { name: 'red 1' });

    first.focus();
    await userEvent.keyboard('{Alt>}{ArrowRight}{ArrowRight}{/Alt}');

    expect(cardNames(3)).toEqual(['red 2', 'red 3', 'red 1']);
    expect(document.activeElement).toBe(first);
  });

  it('keeps cards unselectable before drawing and ignores a move off the end', async () => {
    renderGame(makeGame([num(1), num(2)]));
    const first = screen.getByRole('button', { name: 'red 1' });

    expect(first.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(first);
    first.focus();
    await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');

    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(cardNames(2)).toEqual(['red 1', 'red 2']);
  });

  it('stops arranging once a discard is chosen', async () => {
    renderGame(makeGame([num(1), num(2), num(3)], { turnStep: 'play' }));

    await userEvent.click(screen.getByRole('button', { name: 'red 3' }));
    await userEvent.click(screen.getByRole('button', { name: TURN_COPY.discardLabel('red 3') }));
    screen.getByRole('button', { name: 'red 1' }).focus();
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(cardNames(2)).toEqual(['red 1', 'red 2']);
  });
});
