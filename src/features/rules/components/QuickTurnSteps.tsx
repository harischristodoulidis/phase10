import { RULES_COPY, TURN_STEPS } from '../constants';
import { RulesSection } from './RulesSection';

export function QuickTurnSteps() {
  return (
    <RulesSection title={RULES_COPY.turnTitle}>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[15px] leading-normal text-body">
        {TURN_STEPS.map((step) => (
          <li key={step.term}>
            <strong className="text-ink">{step.term}</strong>
            {step.text}
          </li>
        ))}
      </ol>
    </RulesSection>
  );
}
