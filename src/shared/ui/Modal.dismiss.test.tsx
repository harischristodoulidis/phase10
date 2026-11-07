import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { closeStub, installDialogStubs } from './dialogStubs';
import { Modal } from './Modal';

beforeEach(installDialogStubs);
afterEach(cleanup);

describe('Modal dismissal', () => {
  it('calls onClose on Escape (the cancel event)', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Quick rules" />);

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on a backdrop click', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Quick rules" />);
    const dialog = screen.getByRole('dialog');

    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('stays open when a press starts inside and ends on the backdrop', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Quick rules" />);

    fireEvent.pointerDown(screen.getByRole('heading', { name: 'Quick rules' }));
    fireEvent.click(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores backdrop clicks on a confirm', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} kind="confirm" title="Reset?" />);
    const dialog = screen.getByRole('alertdialog');

    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('reports a native close while open', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Quick rules" />);

    fireEvent(screen.getByRole('dialog'), new Event('close'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes the dialog when unmounted while open', () => {
    const { unmount } = render(<Modal open onClose={() => {}} title="Quick rules" />);

    unmount();

    expect(closeStub).toHaveBeenCalledOnce();
  });
});
