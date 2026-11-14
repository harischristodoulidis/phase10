import type { GroupType } from '@features/game-engine';

function cards(count: number): string {
  return count === 1 ? '1 card' : `${count} cards`;
}

const GROUP_NAMES = {
  set: 'Set',
  run: 'Run',
  color: 'Color',
} as const satisfies Record<GroupType, string>;

export const TURN_COPY = {
  pageTitle: 'Your turn · Phase 10',
  wordmark: 'Phase 10',
  round: (round: number) => `Round ${round}`,
  tableInfo: (dealer: string, drawCount: number) =>
    `Dealer: ${dealer} · ${cards(drawCount)} in draw pile`,
  rules: 'Rules',
  reset: 'Reset game',
  eyebrow: 'Your turn',
  phase: (phase: number) => `Phase ${phase} · `,
  drawPile: 'Draw pile',
  drawPileAction: 'Draw from the draw pile',
  drawPileFace: ['PHASE', '10'],
  discardPile: 'Discard',
  discardPileAction: 'Take the top discard',
  emptyDiscard: 'Empty discard pile',
  phaseOnTable: 'Your phase on the table',
  groupLabel: (type: GroupType, size: number) => `${GROUP_NAMES[type]} of ${size}`,
  otherPlayers: 'Other players',
  opponentStatus: (cardCount: number, isDown: boolean) =>
    `${cards(cardCount)} · ${isDown ? 'down' : 'not down'}`,
  hitButton: 'Add here',
  hitLabel: (card: string, group: string, owner: string | null) =>
    `${card} to ${owner === null ? 'your' : `${owner}’s`} ${group.toLowerCase()}`,
  hand: (cardCount: number) => `Your hand · ${cards(cardCount)}`,
  layDown: 'Lay down phase',
  discard: 'Discard selected',
  cancel: 'Cancel',
  confirmPhase: (cardCount: number) => `Confirm phase · ${cards(cardCount)}`,
  nextPlayer: 'Next player',
} as const;

export const HINTS = {
  draw: 'Draw a card from either pile to begin.',
  skipOnDiscard: 'A Skip can’t be picked up — draw from the draw pile.',
  nothingToDraw: 'There’s nothing to draw. Tap the draw pile to carry on without a card.',
  play: 'Tap a card to discard it — or lay down your phase if you think you have it.',
  playLaidDown: 'Tap a card to discard it — or add it to a phase on the table.',
  discardSelected: 'Discard the selected card to end your turn.',
  discardSkip: 'Discard the Skip, then choose who loses a turn.',
  discardSkipNoTarget: 'Everyone has been skipped this round, so this Skip has no effect.',
  laying: 'Tap the cards for your phase, then confirm.',
  done: 'Turn complete. Hide your cards and pass the device.',
  skipPlayed: (name: string) => `Skip played on ${name}. Hide your cards and pass the device.`,
} as const;

export const HAND_COPY = {
  arrangeHint: 'Drag a card to move it in your hand, or press Alt and the arrow keys.',
} as const;

export const RESET_COPY = {
  title: 'Reset the game?',
  description:
    'All scores and phases will be cleared and you’ll go back to player setup. This can’t be undone.',
  keep: 'Keep playing',
  confirm: 'Reset game',
} as const;

export const SKIP_COPY = {
  title: 'Who loses a turn?',
  description:
    'Pick the player your Skip goes against. Each player can only be skipped once per round.',
  available: 'Not skipped yet',
  used: 'Already skipped',
  cancel: 'Cancel',
} as const;

export const HANDOFF_COPY = {
  pageTitle: (name: string) => `Pass to ${name} · Phase 10`,
  status: (lastAction: string | null) =>
    lastAction === null || lastAction === ''
      ? 'Cards are hidden'
      : `${lastAction} · Cards are hidden`,
  title: (name: string) => `Pass to ${name}`,
  details: (phase: number, label: string, cardCount: number) =>
    `Phase ${phase} · ${label} · ${cards(cardCount)} in hand`,
  reveal: (name: string) => `I’m ${name} — show my cards`,
  hint: (name: string) => `Only tap this once the device is in ${name}’s hands.`,
} as const;

function nameList(names: readonly string[]): string {
  return names.length <= 1
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} and ${names.at(-1) ?? ''}`;
}

export const ROUND_COPY = {
  pageTitle: (round: number) => `Round ${round} summary · Phase 10`,
  status: (round: number) => `Round ${round} is over · Scores are in`,
  title: (name: string) => `${name} went out`,
  tieTitle: 'Tie on Phase 10',
  details: (dealer: string, round: number) => `${dealer} deals Round ${round}`,
  tieDetails: (names: readonly string[], hasSitOuts: boolean) =>
    `${nameList(names)} replay Phase 10${hasSitOuts ? ' · Everyone else sits out' : ''}`,
  resultsTitle: 'This round',
  wentOut: 'Went out',
  advanced: (from: number, to: number) => `Phase ${from} done · on to Phase ${to}`,
  repeats: (phase: number) => `Phase ${phase} not down · repeats it`,
  tied: 'Phase 10 done · tied',
  sitsOut: 'Sits out the tiebreak',
  points: (points: number) => `+${points}`,
  pointsLabel: ' points this round',
  total: (total: number) => `${total} total`,
  action: (round: number) => `Deal Round ${round}`,
  tieAction: 'Deal the tiebreak',
  hint: 'After the deal, the next screen shows who plays first.',
} as const;

export const GAME_OVER_COPY = {
  pageTitle: (name: string) => `${name} wins · Phase 10`,
  status: (round: number) => `Game over after ${round === 1 ? '1 round' : `${round} rounds`}`,
  title: (name: string) => `${name} wins!`,
  reasons: {
    onlyFinisher: 'Completed Phase 10 first',
    lowestTotal: 'Completed Phase 10 with the lowest total',
    tiebreak: 'Went out first in the tiebreak',
  },
  cardLabel: '10',
  standingsTitle: 'Final standings',
  winner: 'Winner',
  finished: 'Phase 10 done',
  reached: (phase: number) => `Reached Phase ${phase}`,
  points: 'points',
  action: 'New game',
  hint: 'Your players stay filled in on the setup screen.',
} as const;
