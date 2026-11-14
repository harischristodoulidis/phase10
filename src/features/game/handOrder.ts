export function moveId(ids: readonly string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) {
    return [...ids];
  }
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function nudgeTarget(key: string, from: number): number | null {
  switch (key) {
    case 'ArrowLeft':
      return from - 1;
    case 'ArrowRight':
      return from + 1;
    default:
      return null;
  }
}
