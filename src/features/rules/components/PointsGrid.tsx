import { POINTS, RULES_COPY } from '../constants';
import { RulesSection } from './RulesSection';

export function PointsGrid() {
  return (
    <RulesSection title={RULES_COPY.pointsTitle}>
      <ul className="grid grid-cols-2 gap-2 text-[15px] text-ink">
        {POINTS.map((row) => (
          <li key={row.label} className="rounded-[10px] bg-subtle px-3 py-2.5">
            {row.label} · <strong>{row.points}</strong>
          </li>
        ))}
      </ul>
    </RulesSection>
  );
}
