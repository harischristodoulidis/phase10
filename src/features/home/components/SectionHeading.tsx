import type { ReactNode } from 'react';

type SectionHeadingProps = {
  children: ReactNode;
};

export function SectionHeading({ children }: SectionHeadingProps) {
  return <h2 className="font-display text-[40px] leading-tight font-bold text-ink">{children}</h2>;
}
