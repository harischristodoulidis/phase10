import { describe, expect, it } from 'vite-plus/test';

import { focusOnMount } from './focusOnMount';

describe('focusOnMount', () => {
  it('focuses the element it is given', () => {
    const heading = document.createElement('h1');
    heading.tabIndex = -1;
    document.body.append(heading);

    focusOnMount(heading);

    expect(document.activeElement).toBe(heading);
    heading.remove();
  });

  it('ignores a detached ref', () => {
    expect(() => focusOnMount(null)).not.toThrow();
  });
});
