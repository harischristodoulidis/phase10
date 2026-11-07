const BAR_CLASSES = ['bg-card-red', 'bg-card-blue', 'bg-card-green', 'bg-card-yellow'] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div aria-hidden="true" className="flex gap-[3px]">
        {BAR_CLASSES.map((bar) => (
          <span key={bar} className={`h-[22px] w-2.5 rounded-[3px] ${bar}`} />
        ))}
      </div>
      <span className="font-display text-[22px] font-bold text-ink">Phase 10</span>
    </div>
  );
}
