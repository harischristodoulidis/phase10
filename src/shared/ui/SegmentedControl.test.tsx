import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { SegmentedControl } from './SegmentedControl';

afterEach(cleanup);

const OPTIONS = [2, 3, 4] as const;

describe('SegmentedControl', () => {
  it('marks only the selected option as pressed', () => {
    render(<SegmentedControl options={OPTIONS} value={3} onChange={() => {}} labelledBy="x" />);

    expect(screen.getByRole('button', { name: '3' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '2' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('calls onChange with the clicked option', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={OPTIONS} value={3} onChange={onChange} labelledBy="x" />);

    await userEvent.click(screen.getByRole('button', { name: '4' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('uses getLabel for the option text', () => {
    render(
      <SegmentedControl
        options={['a', 'b']}
        value="a"
        onChange={() => {}}
        labelledBy="x"
        getLabel={(option) => option.toUpperCase()}
      />
    );

    expect(screen.getByRole('button', { name: 'B' })).toBeTruthy();
  });
});
