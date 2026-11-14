export type CardTone = 'red' | 'blue' | 'green' | 'yellow' | 'wild' | 'skip';

export type CardFaceSize = 'pile' | 'md' | 'slot' | 'sm';

type CardFaceProps = {
  tone: CardTone;
  label: string;
  size?: CardFaceSize;
  className?: string;
};

type LabelKind = 'number' | 'wild' | 'skip';

const TONE_CLASSES = {
  red: 'bg-card-red text-white',
  blue: 'bg-card-blue text-white',
  green: 'bg-card-green text-white',
  yellow: 'bg-card-yellow text-ink',
  wild: 'bg-card-wild text-white',
  skip: 'bg-card-skip text-white',
} as const satisfies Record<CardTone, string>;

const SIZE_CLASSES = {
  pile: 'h-[136px] w-24 rounded-[14px] border-3 shadow-pile-top',
  md: 'h-[104px] w-[72px] rounded-xl border-3 shadow-md',
  slot: 'h-[68px] w-12 rounded-[9px] border-2',
  sm: 'h-12 w-[34px] rounded-[7px] border-2 text-lg shadow-sm',
} as const satisfies Record<CardFaceSize, string>;

const LABEL_CLASSES = {
  pile: { number: 'text-5xl', wild: 'text-5xl', skip: 'text-lg' },
  md: { number: 'text-[40px]', wild: 'text-[34px]', skip: 'text-lg' },
  slot: { number: 'text-2xl', wild: 'text-2xl', skip: 'text-[10px]' },
  sm: { number: '', wild: '', skip: '' },
} as const satisfies Record<CardFaceSize, Record<LabelKind, string>>;

function labelKind(tone: CardTone): LabelKind {
  if (tone === 'wild' || tone === 'skip') {
    return tone;
  }
  return 'number';
}

export function CardFace({ tone, label, size = 'md', className = '' }: CardFaceProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border-surface font-display font-bold ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${LABEL_CLASSES[size][labelKind(tone)]} ${className}`}
    >
      {label}
    </div>
  );
}
