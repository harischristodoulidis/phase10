import type { ReactNode } from 'react';

type BadgeSize = 'md' | 'sm';

type BadgeProps = {
  size?: BadgeSize;
  className?: string;
  children: ReactNode;
};

const SIZE_CLASSES = {
  md: 'px-3 py-1.5 text-sm text-ink',
  sm: 'px-2.5 py-1.5 text-[13px] text-muted',
} as const satisfies Record<BadgeSize, string>;

export function Badge({ size = 'md', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-page leading-none font-semibold ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </span>
  );
}
