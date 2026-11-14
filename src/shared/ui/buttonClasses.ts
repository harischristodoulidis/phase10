export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonStyle = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onDark?: boolean;
};

const BASE_CLASSES = 'inline-flex items-center justify-center gap-2.5 font-semibold';

const SIZE_CLASSES = {
  sm: 'min-h-11 rounded-xl px-3.5 text-sm',
  md: 'min-h-13 rounded-[14px] px-5.5 text-base',
  lg: 'min-h-14 rounded-[14px] px-7 text-[17px]',
} as const satisfies Record<ButtonSize, string>;

const VARIANT_CLASSES = {
  primary: { light: 'bg-ink text-white', dark: 'bg-card-blue text-white' },
  secondary: {
    light: 'border border-line-strong bg-surface text-ink',
    dark: 'border-2 border-focus bg-transparent text-white',
  },
  ghost: { light: 'text-link hover:text-link-hover', dark: 'text-white' },
  danger: { light: 'bg-card-red text-white', dark: 'bg-card-red text-white' },
  inverse: { light: 'bg-surface text-ink', dark: 'bg-surface text-ink' },
} as const satisfies Record<ButtonVariant, Record<'light' | 'dark', string>>;

const DISABLED_CLASSES = {
  light: 'disabled:cursor-not-allowed disabled:opacity-50',
  dark: 'disabled:cursor-not-allowed disabled:border-2 disabled:border-table-raised disabled:bg-transparent disabled:text-table-disabled',
} as const;

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  onDark = false,
}: ButtonStyle = {}): string {
  const surface = onDark ? 'dark' : 'light';
  return `${BASE_CLASSES} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant][surface]} ${DISABLED_CLASSES[surface]}`;
}
