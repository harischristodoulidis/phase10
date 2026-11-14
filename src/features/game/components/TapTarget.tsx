import type { Resolution } from '../turnMoves';

type TapTargetProps = {
  resolution: Resolution | null;
  label: string;
  onTap: () => void;
};

// Covers a drop zone while cards are selected, so tapping the zone plays them there.
export function TapTarget({ resolution, label, onTap }: TapTargetProps) {
  if (resolution === null || resolution.kind === 'none') {
    return null;
  }
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onTap}
      className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-ring-dark"
    />
  );
}
