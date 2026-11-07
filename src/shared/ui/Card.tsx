import type { ReactNode } from 'react';

type CardElement = 'div' | 'section' | 'li' | 'article';
export type CardVariant = 'surface' | 'subtle' | 'outlined' | 'inverse';
type CardPadding = 'sm' | 'md' | 'lg';

type CardProps = {
  as?: CardElement;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
};

const VARIANT_CLASSES = {
  surface: 'rounded-[20px] bg-surface shadow-panel',
  subtle: 'rounded-2xl bg-subtle',
  outlined: 'rounded-2xl border border-line',
  inverse: 'rounded-2xl border border-ink bg-ink text-white focus-ring-dark',
} as const satisfies Record<CardVariant, string>;

const PADDING_CLASSES = {
  sm: 'p-[18px]',
  md: 'p-6',
  lg: 'p-7',
} as const satisfies Record<CardPadding, string>;

export function Card({
  as: Element = 'div',
  variant = 'surface',
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <Element
      className={`flex flex-col ${VARIANT_CLASSES[variant]} ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </Element>
  );
}
