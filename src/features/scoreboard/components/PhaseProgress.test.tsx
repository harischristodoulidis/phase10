import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { PhaseProgress } from './PhaseProgress';

afterEach(cleanup);

describe('PhaseProgress', () => {
  it('fills the segments up to and including the current phase', () => {
    render(<PhaseProgress name="Ana" phase={3} />);

    const bar = screen.getByRole('img', { name: 'Ana is on phase 3 of 10' });
    const filled = [...bar.children].filter((segment) => segment.className.includes('bg-ink'));
    expect(bar.children).toHaveLength(10);
    expect(filled).toHaveLength(3);
  });
});
