import { useId, type ReactNode } from 'react';

import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { focusOnMount } from '@lib/focusOnMount';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

type SummaryTableProps = {
  decor?: ReactNode;
  status: string;
  title: string;
  subtitle: string;
  listTitle: string;
  actionLabel: string;
  onAction: () => void;
  hint: string;
  children: ReactNode;
};

export function SummaryTable({
  decor,
  status,
  title,
  subtitle,
  listTitle,
  actionLabel,
  onAction,
  hint,
  children,
}: SummaryTableProps) {
  const listId = useId();
  return (
    <main className="flex min-h-[640px] min-w-0 flex-[999_1_640px] flex-col items-center justify-center gap-7 rounded-3xl bg-table px-4 py-12 text-center text-white focus-ring-dark sm:px-8">
      {decor}
      <div className="flex flex-col items-center gap-2.5">
        <p className="text-[15px] text-table-muted">{status}</p>
        <h1
          ref={focusOnMount}
          tabIndex={-1}
          className="font-display text-[44px] leading-tight font-bold tracking-[-0.01em] outline-none sm:text-[56px]"
        >
          {title}
        </h1>
        <p className="text-lg text-table-soft">{subtitle}</p>
      </div>
      <section
        aria-labelledby={listId}
        className="flex w-full max-w-[560px] flex-col gap-2.5 text-left"
      >
        <h2 id={listId} className="text-sm font-semibold text-table-muted">
          {listTitle}
        </h2>
        <ol className="flex flex-col gap-2">{children}</ol>
      </section>
      <Button
        variant="inverse"
        size="lg"
        onDark
        endIcon={<Icon src={arrowRightIcon} size={22} />}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
      <p className="text-sm text-table-muted">{hint}</p>
    </main>
  );
}
