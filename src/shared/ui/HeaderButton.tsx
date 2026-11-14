import type { ComponentProps, ReactNode } from 'react';

type HeaderButtonTone = 'default' | 'danger';

type HeaderButtonProps = ComponentProps<'button'> & {
  icon: ReactNode;
  tone?: HeaderButtonTone;
};

const TONE_CLASSES = {
  default: 'text-ink',
  danger: 'text-danger',
} as const satisfies Record<HeaderButtonTone, string>;

export function HeaderButton({
  icon,
  tone = 'default',
  type = 'button',
  className = '',
  children,
  ...rest
}: HeaderButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold ${TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
