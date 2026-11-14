import type { ReactNode } from 'react';

type RulesSectionProps = {
  title: string;
  children: ReactNode;
};

export function RulesSection({ title, children }: RulesSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}
