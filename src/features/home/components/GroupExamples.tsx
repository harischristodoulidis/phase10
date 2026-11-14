import { Card } from '@ui/Card';
import { CardFace } from '@ui/CardFace';

import { GROUP_EXAMPLES } from '../constants';

export function GroupExamples() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
      {GROUP_EXAMPLES.map((group) => (
        <Card key={group.title} variant="subtle" className="gap-3">
          <strong className="text-[17px] text-ink">{group.title}</strong>
          <span className="text-[15px] text-body">{group.body}</span>
          <div aria-hidden="true" className="flex gap-1.5">
            {group.cards.map((card) => (
              <CardFace
                key={`${card.tone}-${card.label}`}
                tone={card.tone}
                label={card.label}
                size="sm"
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
