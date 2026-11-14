import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import { makeStore, type AppStore } from '@app/store';
import type { GameState } from '@features/game-engine';

import { GamePage } from '../pages/GamePage';

export const SETUP_STUB = 'Setup page';

export function renderGame(game: GameState | null): AppStore {
  const store = makeStore({ game });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route path="/game" element={<GamePage />} />
          <Route path="/setup" element={<h1>{SETUP_STUB}</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
}
