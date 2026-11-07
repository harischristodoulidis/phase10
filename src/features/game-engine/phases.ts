import type { GroupRequirement, PhaseNumber, PhaseRequirement } from './types';

function set(size: number): GroupRequirement {
  return { type: 'set', size };
}

function run(size: number): GroupRequirement {
  return { type: 'run', size };
}

function color(size: number): GroupRequirement {
  return { type: 'color', size };
}

export const PHASES: readonly PhaseRequirement[] = [
  { phase: 1, groups: [set(3), set(3)], label: '2 sets of 3' },
  { phase: 2, groups: [set(3), run(4)], label: '1 set of 3 + 1 run of 4' },
  { phase: 3, groups: [set(4), run(4)], label: '1 set of 4 + 1 run of 4' },
  { phase: 4, groups: [run(7)], label: '1 run of 7' },
  { phase: 5, groups: [run(8)], label: '1 run of 8' },
  { phase: 6, groups: [run(9)], label: '1 run of 9' },
  { phase: 7, groups: [set(4), set(4)], label: '2 sets of 4' },
  { phase: 8, groups: [color(7)], label: '7 cards of one color' },
  { phase: 9, groups: [set(5), set(2)], label: '1 set of 5 + 1 set of 2' },
  { phase: 10, groups: [set(4), set(3)], label: '1 set of 4 + 1 set of 3' },
];

export function getPhase(phase: PhaseNumber): PhaseRequirement {
  return PHASES[phase - 1];
}

export function phaseCardCount(requirement: PhaseRequirement): number {
  return requirement.groups.reduce((sum, group) => sum + group.size, 0);
}
