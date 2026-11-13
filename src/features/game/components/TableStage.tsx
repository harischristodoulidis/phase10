import type { ReactNode } from 'react';

import { focusOnMount } from '@lib/focusOnMount';

type TableStageProps = {
  decor?: ReactNode;
  status: string;
  title: string;
  subtitle: string;
  hint: string;
  children: ReactNode;
};

export function TableStage({ decor, status, title, subtitle, hint, children }: TableStageProps) {
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
      {children}
      <p className="text-sm text-table-muted">{hint}</p>
    </main>
  );
}
