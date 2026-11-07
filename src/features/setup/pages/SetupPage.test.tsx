import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
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
      <MemoryRouter>
        <SetupPage />
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
});
