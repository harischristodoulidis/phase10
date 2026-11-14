// A stable ref callback, so React runs it only when the element mounts, not on every render.
export function focusOnMount(node: HTMLElement | null): void {
  node?.focus();
}
