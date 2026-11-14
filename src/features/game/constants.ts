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
  hitLabel: (card: string, group: string, detail: string, owner: string | null) =>
    `Add ${card} to ${owner === null ? 'your' : `${owner}’s`} ${group.toLowerCase()} (${detail})`,
  setDetail: (value: number) => `${value}s`,
  runDetail: (min: number, max: number) => `${min} to ${max}`,
  placeLabel: (card: string, slot: number, label: string) =>
    `Place ${card} in slot ${slot}: ${label.toLowerCase()}`,
  layDownLabel: (count: number) => `Lay down your phase with these ${count} cards`,
  returnLabel: (card: string) => `Return ${card} to your hand`,
  discardLabel: (card: string) => `Discard ${card}`,
  discardOneAtATime: 'Discard pile: takes one card at a time',
  undoDiscardLabel: (card: string) => `Take ${card} back into your hand`,
  slotEmpty: 'Drag cards here',
  slotProgress: (label: string, count: number, size: number) =>
    count === 0 ? label : `${label} · ${count} of ${size}`,
  discardDrop: 'Drop to discard',
  hand: (cardCount: number) => `Your hand · ${cards(cardCount)}`,
  nextPlayer: 'Next player',
} as const;

export const HINTS = {
  draw: 'Drag a card from either pile into your hand, or tap a pile.',
  skipOnDiscard: 'A Skip can’t be picked up — drag or tap the draw pile.',
  nothingToDraw: 'There’s nothing to draw. Tap the draw pile to carry on without a card.',
  play: 'Select the cards for a group and drag them into its slot, or drag a card onto the discard pile to end your turn.',
  playLaidDown: 'Drag a card onto the discard pile to end your turn, or onto a group it fits.',
  placing: 'Now fill the other slots — your phase goes down as soon as they’re all complete.',
  selected: 'Now tap where it goes: the discard pile, a phase slot or a group.',
  selectedMany: (count: number) =>
    `${count} cards selected — drag them onto a phase slot or a group, or tap where they go.`,
  selectedSkip: 'Discard the Skip, then choose who loses a turn.',
  discardSkipNoTarget: 'Everyone has been skipped this round, so this Skip has no effect.',
  done: 'Turn complete. Press Next player and pass the device — or drag the card back to change it.',
  skipPlayed: (name: string) => `Skip played on ${name}. Hide your cards and pass the device.`,
} as const;

export const MOVE_COPY = {
  skipInPhase: 'A Skip can’t be used in a phase.',
  layDownFirst: 'Lay down your phase before adding to a group.',
  cantHit: (card: string) => `${card} doesn’t fit that group.`,
  cantHitAll: 'Not all of these cards fit that group.',
  skipInGroup: 'A Skip can’t be added to a group.',
  discardOne: 'Discard one card at a time.',
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
