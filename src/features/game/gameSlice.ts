import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  arrangeHand,
  discard,
  draw,
  hit,
  layDown,
  revealHand,
  startGame,
  startNextRound,
  type DrawSource,
  type GameState,
  type Result,
} from '@features/game-engine';

type GameSliceState = GameState | null;

// Failed moves leave the state as it was: the engine is the guard.
function apply(
  state: GameSliceState,
  move: (game: GameState) => Result<GameState>
): GameSliceState {
  if (state === null) {
    return state;
  }
  const result = move(state);
  return result.ok ? result.value : state;
}

export const gameSlice = createSlice({
  name: 'game',
  initialState: null as GameSliceState,
  reducers: {
    gameStarted: {
      reducer(state, action: PayloadAction<{ names: string[]; seed: number }>) {
        const result = startGame(action.payload.names, action.payload.seed);
        return result.ok ? result.value : state;
      },
      prepare(names: readonly string[]) {
        return { payload: { names: [...names], seed: Date.now() } };
      },
    },
    handRevealed(state) {
      return apply(state, revealHand);
    },
    handArranged(state, action: PayloadAction<string[]>) {
      return apply(state, (game) => arrangeHand(game, action.payload));
    },
    cardDrawn(state, action: PayloadAction<DrawSource>) {
      return apply(state, (game) => draw(game, action.payload));
    },
    phaseLaidDown(state, action: PayloadAction<string[][]>) {
      return apply(state, (game) => layDown(game, action.payload));
    },
    cardHit(state, action: PayloadAction<{ cardIds: string[]; groupId: string }>) {
      return apply(state, (game) => hit(game, action.payload.cardIds, action.payload.groupId));
    },
    cardDiscarded(state, action: PayloadAction<{ cardId: string; skipTargetId?: string }>) {
      return apply(state, (game) =>
        discard(game, action.payload.cardId, action.payload.skipTargetId)
      );
    },
    nextRoundStarted(state) {
      return apply(state, startNextRound);
    },
    gameReset() {
      return null;
    },
  },
});

export const {
  gameStarted,
  handRevealed,
  handArranged,
  cardDrawn,
  phaseLaidDown,
  cardHit,
  cardDiscarded,
  nextRoundStarted,
  gameReset,
} = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
