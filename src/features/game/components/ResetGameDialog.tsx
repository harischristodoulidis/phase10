import { Button } from '@ui/Button';
import { Modal } from '@ui/Modal';

import { RESET_COPY } from '../constants';

type ResetGameDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ResetGameDialog({ open, onClose, onConfirm }: ResetGameDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      kind="confirm"
      title={RESET_COPY.title}
      description={RESET_COPY.description}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {RESET_COPY.keep}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {RESET_COPY.confirm}
          </Button>
        </>
      }
    />
  );
}
