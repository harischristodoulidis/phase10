import {
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from 'react';

export function useDialog(open: boolean, onClose: () => void, closesOnBackdrop: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Close before the element leaves the DOM so the browser returns focus to the opener.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open === true) {
        dialog.close();
      }
    };
  }, []);

  const dialogProps = {
    ref: dialogRef,
    onCancel: (e: SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onClose();
    },
    onClose: () => {
      if (open) {
        onClose();
      }
    },
    onPointerDown: (e: PointerEvent<HTMLDialogElement>) => {
      pressStartedOnBackdrop.current = e.target === e.currentTarget;
    },
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      const isBackdropClick = pressStartedOnBackdrop.current && e.target === e.currentTarget;
      pressStartedOnBackdrop.current = false;
      if (closesOnBackdrop && isBackdropClick) {
        onClose();
      }
    },
  };

  return dialogProps;
}
