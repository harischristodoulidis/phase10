import { combineReducers, configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

import { isSetupState, setupReducer } from '@features/setup';

import { loadJson, saveJson } from '@lib/storage';

export const STORAGE_KEY = 'phase10:state';

const rootReducer = combineReducers({ setup: setupReducer });

export type RootState = ReturnType<typeof rootReducer>;

export function loadPersistedState(): Partial<RootState> {
  const saved = loadJson(STORAGE_KEY);
  if (typeof saved !== 'object' || saved === null || !('setup' in saved)) {
    return {};
  }
  return isSetupState(saved.setup) ? { setup: saved.setup } : {};
}

export function makeStore(preloadedState?: Partial<RootState>) {
  const persistence = createListenerMiddleware<RootState>();
  persistence.startListening({
    predicate: () => true,
    effect: (_action, api) => {
      const { setup } = api.getState();
      saveJson(STORAGE_KEY, { setup });
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
