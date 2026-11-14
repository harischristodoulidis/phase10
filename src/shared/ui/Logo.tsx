import logoSrc from '@assets/logo.svg';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logoSrc} alt="" className="size-9" />
      <span className="font-display text-[22px] font-bold text-ink">Phase 10</span>
    </div>
  );
}
