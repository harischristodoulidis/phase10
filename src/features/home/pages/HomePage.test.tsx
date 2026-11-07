import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { PHASES } from '@features/game-engine';

import { HOME_COPY, NAV_LINKS } from '../constants';
import { HomePage } from './HomePage';

afterEach(cleanup);

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('shows the title as the page heading', () => {
    renderPage();

    const name = HOME_COPY.titleLines.join(' ');
    expect(screen.getByRole('heading', { level: 1, name })).toBeTruthy();
  });

  it('links both calls to action to the setup page', () => {
    renderPage();

    const links = screen.getAllByRole('link', { name: HOME_COPY.setupCta });
    expect(links).toHaveLength(2);
    expect(links.every((link) => link.getAttribute('href') === '/setup')).toBe(true);
  });

  it('links each section in the nav to a section on the page', () => {
    const { container } = renderPage();

    for (const link of NAV_LINKS) {
      expect(container.querySelector(`#${link.id}`)).not.toBeNull();
    }
  });

  it('lists all ten phases from the engine', () => {
    renderPage();

    for (const { label } of PHASES) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('shows the card points table', () => {
    renderPage();

    expect(screen.getByRole('rowheader', { name: 'Wild' })).toBeTruthy();
    expect(screen.getByText('25 points')).toBeTruthy();
  });
});
