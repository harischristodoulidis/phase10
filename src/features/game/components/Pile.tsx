import type { ReactNode } from 'react';

type PileProps = {
  caption: string;
  actionLabel: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function Pile({ caption, actionLabel, disabled, onClick, children }: PileProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={actionLabel}
        disabled={disabled}
        onClick={onClick}
        className="rounded-[14px] disabled:cursor-not-allowed"
      >
        {children}
      </button>
      <span className="text-[13px] text-table-muted">{caption}</span>
    </div>
  );
}
