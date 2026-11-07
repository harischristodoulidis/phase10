export type CardTone = 'red' | 'blue' | 'green' | 'yellow' | 'wild' | 'skip';

type CardFaceSize = 'md' | 'sm';

type CardFaceProps = {
  tone: CardTone;
  label: string;
  size?: CardFaceSize;
  className?: string;
};

const TONE_CLASSES = {
  red: 'bg-card-red text-white',
  blue: 'bg-card-blue text-white',
  green: 'bg-card-green text-white',
  yellow: 'bg-card-yellow text-ink',
  wild: 'bg-card-wild text-white',
  skip: 'bg-card-skip text-white',
} as const satisfies Record<CardTone, string>;

const SIZE_CLASSES = {
  md: 'h-[104px] w-[72px] rounded-xl border-3 shadow-md',
  sm: 'h-12 w-[34px] rounded-[7px] border-2 text-lg shadow-sm',
} as const satisfies Record<CardFaceSize, string>;

function labelClass(tone: CardTone, size: CardFaceSize): string {
  if (size === 'sm') {
    return '';
  }
  if (tone === 'skip') {
    return 'text-lg';
  }
  return tone === 'wild' ? 'text-[34px]' : 'text-[40px]';
}

export function CardFace({ tone, label, size = 'md', className = '' }: CardFaceProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border-surface font-display font-bold ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${labelClass(tone, size)} ${className}`}
    >
      {label}
    </div>
  );
}
