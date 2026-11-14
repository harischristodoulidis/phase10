import { cardPoints } from '@features/game-engine';

import type { CardTone } from '@ui/CardFace';

type CardSample = { tone: CardTone; label: string };

type CardGroupCopy = { title: string; body: string; cards: readonly CardSample[] };

export const SECTION_IDS = { how: 'how', phases: 'phases', scoring: 'scoring' } as const;

export const HOME_COPY = {
  pageTitle: 'Phase 10',
  eyebrow: '2–6 players · Ages 7+ · Pass-and-play',
  titleLines: ['Ten phases.', 'One winner.'],
  intro:
    'Phase 10 is a rummy-style card game. Every round you try to collect a specific combination of cards — a “phase”. Complete it and you move on to the next one. The first player to finish all ten phases wins.',
  setupCta: 'Set up a game',
  rulesLink: 'Read the rules first',
} as const;

export const NAV_LINKS = [
  { id: SECTION_IDS.how, label: 'How to play' },
  { id: SECTION_IDS.phases, label: 'The 10 phases' },
  { id: SECTION_IDS.scoring, label: 'Scoring' },
] as const;

export const HERO_CARDS = [
  { tone: 'red', label: '7', className: 'left-[8%] top-[70px] -rotate-18' },
  { tone: 'blue', label: '8', className: 'left-[30%] top-[40px] -rotate-6' },
  { tone: 'wild', label: 'W', className: 'left-[52%] top-[40px] rotate-6' },
  { tone: 'yellow', label: '10', className: 'left-[74%] top-[70px] rotate-18' },
] as const satisfies readonly (CardSample & { className: string })[];

export const ROUND_BASICS = [
  {
    title: 'The deal',
    body: 'Each player gets 10 cards. The rest form the draw pile; the top card is flipped to start the discard pile. The player left of the dealer goes first, play moves clockwise, and the deal passes left each round.',
  },
  {
    title: 'Your goal each round',
    body: 'Collect the cards for your current phase and lay them down — only one phase per round. Everyone starts on Phase 1 and moves on only after completing it.',
  },
  {
    title: 'Ending a round',
    body: 'The round ends as soon as one player gets rid of all their cards. Anyone who laid down their phase advances; others repeat it.',
  },
] as const;

export const TURN_STEPS = [
  { title: 'Draw', body: 'Take the top card from the draw pile or the discard pile.' },
  {
    title: 'Lay down (optional)',
    body: 'If you hold your whole phase, place it face up. You can’t lay down part of a phase.',
  },
  {
    title: 'Hit (optional)',
    body: 'Once your phase is down, add cards to any phase on the table — yours or another player’s.',
  },
  {
    title: 'Discard',
    body: 'Finish by placing one card on the discard pile, then press “Next player”.',
  },
] as const;

export const CARD_TYPES = [
  {
    title: 'Number cards · 96',
    body: 'Numbers 1–12 in four colors: red, blue, green and yellow — two of each.',
    basis: 'flex-[1_1_320px]',
    cards: [
      { tone: 'red', label: '1' },
      { tone: 'blue', label: '5' },
      { tone: 'green', label: '9' },
      { tone: 'yellow', label: '12' },
    ],
  },
  {
    title: 'Wild · 8',
    body: 'Stands in for any number or color, in a phase or a hit. A phase needs at least one regular card, and a placed Wild can’t be moved.',
    basis: 'flex-[1_1_200px]',
    cards: [{ tone: 'wild', label: 'W' }],
  },
  {
    title: 'Skip · 4',
    body: 'Discard it and choose a player who loses their next turn — each player only once per round. Can’t be used in a phase or picked up from the discard pile.',
    basis: 'flex-[1_1_200px]',
    cards: [{ tone: 'skip', label: 'SKIP' }],
  },
] as const satisfies readonly (CardGroupCopy & { basis: string })[];

export const GROUP_EXAMPLES = [
  {
    title: 'Set',
    body: 'Cards with the same number, any colors.',
    cards: [
      { tone: 'red', label: '8' },
      { tone: 'green', label: '8' },
      { tone: 'yellow', label: '8' },
    ],
  },
  {
    title: 'Run',
    body: 'Numbers in a row, any colors.',
    cards: [
      { tone: 'blue', label: '3' },
      { tone: 'red', label: '4' },
      { tone: 'wild', label: 'W' },
      { tone: 'yellow', label: '6' },
    ],
  },
  {
    title: 'Color',
    body: 'Cards of one color, any numbers.',
    cards: [
      { tone: 'green', label: '2' },
      { tone: 'green', label: '7' },
      { tone: 'green', label: '11' },
    ],
  },
] as const satisfies readonly CardGroupCopy[];

export const SCORING_COPY = {
  title: 'Scoring',
  intro:
    'When a round ends, the player who went out scores 0. Everyone else adds up the cards still in their hand — cards laid on the table don’t count. Points are bad: lower is better.',
  caption: 'Points per card left in hand',
  winningTitle: 'Winning',
  winning: [
    'The first player to complete Phase 10 wins. If more than one player completes it in the same round, the one with the lowest total score takes the game. Still tied? Those players replay Phase 10 and the first to go out wins.',
    'This app tracks every phase and total for you — just play the cards.',
  ],
} as const;

export const SCORE_ROWS = [
  { label: 'Cards 1–9', points: cardPoints({ kind: 'number', id: 'low', value: 1, color: 'red' }) },
  {
    label: 'Cards 10–12',
    points: cardPoints({ kind: 'number', id: 'high', value: 10, color: 'red' }),
  },
  { label: 'Skip', points: cardPoints({ kind: 'skip', id: 'skip' }) },
  { label: 'Wild', points: cardPoints({ kind: 'wild', id: 'wild' }) },
] as const;

export const SECTION_TITLES = {
  how: 'How to play',
  turn: 'On your turn',
  cards: 'The cards',
  phases: 'The 10 phases',
} as const;

export const CTA_COPY = {
  title: 'Ready to deal?',
  body: 'Pick your players and start Round 1.',
} as const;
