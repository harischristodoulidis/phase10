import { combineReducers, configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

import { gameReducer, isGameState } from '@features/game';
import { isSetupState, setupReducer } from '@features/setup';

import { loadJson, saveJson } from '@lib/storage';

export const STORAGE_KEY = 'phase10:state';

const rootReducer = combineReducers({ setup: setupReducer, game: gameReducer });

export type RootState = ReturnType<typeof rootReducer>;

export function loadPersistedState(): Partial<RootState> {
  const saved = loadJson(STORAGE_KEY);
  if (typeof saved !== 'object' || saved === null) {
    return {};
  }
  const setup = 'setup' in saved && isSetupState(saved.setup) ? { setup: saved.setup } : {};
  const game = 'game' in saved && isGameState(saved.game) ? { game: saved.game } : {};
  return { ...setup, ...game };
}

export function makeStore(preloadedState?: Partial<RootState>) {
  const persistence = createListenerMiddleware<RootState>();
  persistence.startListening({
    predicate: () => true,
    effect: (_action, api) => {
      const { setup, game } = api.getState();
      saveJson(STORAGE_KEY, { setup, game });
    },
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().prepend(persistence.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = makeStore(loadPersistedState());
