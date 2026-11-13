import { cardPoints } from '@features/game-engine';

export type RichText = readonly (string | { strong: string })[];

export const RULES_COPY = {
  title: 'Quick rules',
  closeLabel: 'Close rules',
  pausedNote: 'The game stays paused behind this panel.',
  turnTitle: 'On your turn',
  phasesTitle: 'The 10 phases',
  currentPhase: 'Current',
  notesTitle: 'Good to know',
  pointsTitle: 'Points left in hand',
} as const;

export const TURN_STEPS = [
  { term: 'Draw', text: ' one card from the draw pile or the discard pile.' },
  { term: 'Lay down', text: ' your whole phase if you have it (optional).' },
  {
    term: 'Hit',
    text: ': once your phase is down, add cards to any phase on the table (optional).',
  },
  { term: 'Discard', text: ' one card, then press Next player.' },
] as const;

export const NOTES: readonly RichText[] = [
  [
    { strong: 'Set' },
    ': same number. ',
    { strong: 'Run' },
    ': numbers in a row. ',
    { strong: 'Color' },
    ': all one color.',
  ],
  ['A Wild stands in for any card. A phase needs at least one regular card.'],
  [
    'Discard a Skip and choose who loses their next turn — each player once per round. Skips can’t be picked up from the discard pile.',
  ],
  ['Only one phase per round. Laid-down cards don’t count against you.'],
  ['The round ends when someone has no cards left.'],
];

export const POINTS = [
  { label: '1–9', points: cardPoints({ kind: 'number', id: 'low', value: 1, color: 'red' }) },
  { label: '10–12', points: cardPoints({ kind: 'number', id: 'high', value: 10, color: 'red' }) },
  { label: 'Skip', points: cardPoints({ kind: 'skip', id: 'skip' }) },
  { label: 'Wild', points: cardPoints({ kind: 'wild', id: 'wild' }) },
] as const;
