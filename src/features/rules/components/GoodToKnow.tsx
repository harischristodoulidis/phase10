import { NOTES, RULES_COPY } from '../constants';
import { RulesSection } from './RulesSection';

export function GoodToKnow() {
  return (
    <RulesSection title={RULES_COPY.notesTitle}>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-normal text-body">
        {NOTES.map((note) => (
          <li key={note.map((part) => (typeof part === 'string' ? part : part.strong)).join('')}>
            {note.map((part) =>
              typeof part === 'string' ? (
                part
              ) : (
                <strong key={part.strong} className="text-ink">
                  {part.strong}
                </strong>
              )
            )}
          </li>
        ))}
      </ul>
    </RulesSection>
  );
}
