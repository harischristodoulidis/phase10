import type { Player } from '@features/game-engine';

export type ScoreboardPlayer = Pick<Player, 'id' | 'name' | 'color' | 'phase' | 'score'>;
