import type { ComponentProps, ReactNode } from 'react';

type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label' | 'children'> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({
  label,
  icon,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:bg-subtle ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
