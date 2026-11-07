export const CARD_COLORS = ['red', 'blue', 'green', 'yellow'] as const;
export const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const SEAT_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'ink'] as const;
export const HAND_SIZE = 10;
export const COPIES_PER_NUMBER = 2;
export const WILD_COUNT = 8;
export const SKIP_COUNT = 4;
export const DECK_SIZE =
  CARD_COLORS.length * CARD_VALUES.length * COPIES_PER_NUMBER + WILD_COUNT + SKIP_COUNT;
export const MIN_CARD_VALUE = Math.min(...CARD_VALUES);
export const MAX_CARD_VALUE = Math.max(...CARD_VALUES);
