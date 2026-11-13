export const SCOREBOARD_COPY = {
  title: 'Scoreboard',
  hint: 'Lower is better',
  columns: { player: 'Player', phase: 'Phase', points: 'Pts' },
  phaseLabel: 'Phase ',
  pointsLabel: ' points',
  progressTitle: 'Phase progress',
  progressLabel: (name: string, phase: number, total: number) =>
    `${name} is on phase ${phase} of ${total}`,
  nextUp: (name: string) => `Next up: ${name}`,
} as const;

export const ROW_GRID = 'grid grid-cols-[1fr_64px_56px] items-center gap-2';
