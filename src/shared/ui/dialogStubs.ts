import { vi } from 'vite-plus/test';

export const showModalStub = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
});

export const closeStub = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open');
});

// jsdom doesn't implement the modal dialog API, so tests install these stubs.
export function installDialogStubs(): void {
  showModalStub.mockClear();
  closeStub.mockClear();
  HTMLDialogElement.prototype.showModal = showModalStub;
  HTMLDialogElement.prototype.close = closeStub;
}
