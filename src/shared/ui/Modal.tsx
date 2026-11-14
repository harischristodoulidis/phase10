import { useId, type ReactNode } from 'react';

import closeIcon from '@assets/icons/close.svg';

import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { useDialog } from './useDialog';

export type ModalKind = 'dialog' | 'confirm';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  kind?: ModalKind;
  closeLabel?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

const KIND_CLASSES = {
  dialog: {
    panel: 'max-h-[calc(100dvh-48px)] max-w-[680px] overflow-y-auto rounded-3xl',
    body: 'gap-6 p-8',
    title: 'text-[28px]',
  },
  confirm: { panel: 'max-w-[440px] rounded-[20px]', body: 'gap-3.5 p-7', title: 'text-[26px]' },
} as const satisfies Record<ModalKind, Record<'panel' | 'body' | 'title', string>>;

export function Modal({
  open,
  onClose,
  title,
  description,
  kind = 'dialog',
  closeLabel = 'Close',
  children,
  actions,
}: ModalProps) {
  const isConfirm = kind === 'confirm';
  const dialogProps = useDialog(open, onClose, !isConfirm);
  const titleId = useId();
  const descriptionId = useId();
  const styles = KIND_CLASSES[kind];

  return (
    <dialog
      {...dialogProps}
      role={isConfirm ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      className={`m-auto w-[calc(100%-48px)] bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay ${styles.panel}`}
    >
      <div className={`flex flex-col ${styles.body}`}>
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className={`font-display leading-tight font-bold ${styles.title}`}>
            {title}
          </h2>
          {!isConfirm && (
            <IconButton label={closeLabel} icon={<Icon src={closeIcon} />} onClick={onClose} />
          )}
        </div>
        {description !== undefined && (
          <p id={descriptionId} className="leading-normal text-body">
            {description}
          </p>
        )}
        {children}
        {actions !== undefined && (
          <div className="mt-2 flex flex-wrap justify-end gap-2.5">{actions}</div>
        )}
      </div>
    </dialog>
  );
}
