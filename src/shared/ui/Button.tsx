import type { ComponentProps, ReactNode } from 'react';

import { buttonClasses, type ButtonStyle } from './buttonClasses';

type ButtonProps = ComponentProps<'button'> &
  ButtonStyle & {
    endIcon?: ReactNode;
  };

export function Button({
  variant,
  size,
  onDark,
  endIcon,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses({ variant, size, onDark })} ${className}`}
      {...rest}
    >
      {children}
      {endIcon}
    </button>
  );
}
