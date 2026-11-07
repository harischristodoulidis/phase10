export { SetupPage } from './pages/SetupPage';
export type { SetupState } from './types';
export { isSetupState } from './isSetupState';
export { selectActiveNames, selectCanStart, selectPlayerCount } from './selectors';
export {
  playerCountChanged,
  playerNameChanged,
  setupReducer,
  setupReset,
  setupSlice,
} from './setupSlice';
