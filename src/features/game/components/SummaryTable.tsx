import { useId, type ReactNode } from 'react';

import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

import { TableStage } from './TableStage';

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
  listTitle,
  actionLabel,
  onAction,
  children,
  ...stage
}: SummaryTableProps) {
  const listId = useId();
  return (
    <TableStage {...stage}>
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
    </TableStage>
  );
}
