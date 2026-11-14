import { PHASES, type PhaseNumber } from '@features/game-engine';

import { RULES_COPY } from '../constants';
import { RulesSection } from './RulesSection';

type QuickPhaseListProps = {
  currentPhase: PhaseNumber | null;
};

export function QuickPhaseList({ currentPhase }: QuickPhaseListProps) {
  return (
    <RulesSection title={RULES_COPY.phasesTitle}>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-1 text-[15px]">
        {PHASES.map(({ phase, label }) => {
          const isCurrent = phase === currentPhase;
          return (
            <li
              key={phase}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex gap-3 rounded-[10px] px-2.5 py-2 ${isCurrent ? 'bg-ink text-white' : 'text-ink'}`}
            >
              <strong className="w-5 shrink-0">{phase}</strong>
              {label}
              {isCurrent && (
                <span className="ml-auto text-[13px] text-table-soft">
                  {RULES_COPY.currentPhase}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </RulesSection>
  );
}
