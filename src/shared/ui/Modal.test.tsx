import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { closeStub, installDialogStubs, showModalStub } from './dialogStubs';
import { Modal } from './Modal';

beforeEach(installDialogStubs);
afterEach(cleanup);

describe('Modal', () => {
  it('opens as a modal dialog labelled by its title', () => {
    render(<Modal open onClose={() => {}} title="Quick rules" />);

    expect(showModalStub).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog', { name: 'Quick rules' })).toBeTruthy();
  });

  it('closes the dialog when open turns false', () => {
    const { rerender } = render(<Modal open onClose={() => {}} title="Quick rules" />);

    rerender(<Modal open={false} onClose={() => {}} title="Quick rules" />);

    expect(closeStub).toHaveBeenCalledOnce();
  });

  it('renders a confirm as an alertdialog described by its description', () => {
    render(
      <Modal
        open
        onClose={() => {}}
        kind="confirm"
        title="Reset the game?"
        description="This can’t be undone."
      />
    );

    const dialog = screen.getByRole('alertdialog', { name: 'Reset the game?' });
    const descriptionId = dialog.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(descriptionId)?.textContent).toBe('This can’t be undone.');
  });

  it('calls onClose from the close button', async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Quick rules" closeLabel="Close rules" />);

    await userEvent.click(screen.getByRole('button', { name: 'Close rules' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders the actions', () => {
    render(
      <Modal
        open
        onClose={() => {}}
        kind="confirm"
        title="Reset?"
        actions={<button>Reset</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy();
  });
});
