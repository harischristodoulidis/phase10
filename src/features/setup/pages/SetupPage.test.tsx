import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { makeStore } from '@app/store';

import { SETUP_COPY } from '../constants';
import { SetupPage } from './SetupPage';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderPage() {
  const store = makeStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/setup']}>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/game" element={<h1>Game</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
}

describe('SetupPage', () => {
  it('shows one name input per player', async () => {
    renderPage();
    expect(screen.getAllByRole('textbox')).toHaveLength(4);

    await userEvent.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getAllByRole('textbox')).toHaveLength(3);
  });

  it('labels the name list with its heading', () => {
    renderPage();

    expect(screen.getByRole('list', { name: SETUP_COPY.namesHeading })).toBeTruthy();
  });

  it('stores typed names', async () => {
    const store = renderPage();

    await userEvent.type(screen.getByLabelText(SETUP_COPY.nameLabel(1)), 'Haris');

    expect(store.getState().setup.names[0]).toBe('Haris');
    expect(screen.getByLabelText(SETUP_COPY.nameLabel(1))).toHaveProperty('value', 'Haris');
  });

  it('marks the last player as dealing first', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '2' }));

    const dealerRow = screen.getByText(SETUP_COPY.dealsFirst).closest('li');

    expect(dealerRow?.querySelector('input')?.id).toBe('player-name-1');
  });

  it('summarises the count and who starts', async () => {
    renderPage();
    expect(screen.getByText(SETUP_COPY.summary(4, 'Player 1'))).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.type(screen.getByLabelText(SETUP_COPY.nameLabel(1)), 'Haris');

    expect(screen.getByText(SETUP_COPY.summary(3, 'Haris'))).toBeTruthy();
  });

  it('starts the game once every player has a name', async () => {
    const store = renderPage();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    const start = screen.getByRole('button', { name: SETUP_COPY.startGame });
    expect(start).toHaveProperty('disabled', true);

    await userEvent.type(screen.getByLabelText(SETUP_COPY.nameLabel(1)), 'Haris');
    await userEvent.type(screen.getByLabelText(SETUP_COPY.nameLabel(2)), 'Maria');
    await userEvent.click(start);

    expect(store.getState().game?.players.map((p) => p.name)).toEqual(['Haris', 'Maria']);
    expect(screen.getByRole('heading', { name: 'Game' })).toBeTruthy();
  });
});
