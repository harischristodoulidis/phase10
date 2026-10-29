import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { HOME_COPY } from '../constants';
import { HomePage } from './HomePage';

afterEach(cleanup);

describe('HomePage', () => {
  it('shows the title as the page heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: HOME_COPY.title })).toBeTruthy();
  });

  it('shows the intro text', () => {
    render(<HomePage />);

    expect(screen.getByText(HOME_COPY.intro)).toBeTruthy();
  });
});
