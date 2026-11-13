import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { PHASES } from '@features/game-engine';

import { installDialogStubs } from '@ui/dialogStubs';

import { RULES_COPY } from '../constants';
import { RulesModal } from './RulesModal';

beforeEach(installDialogStubs);
afterEach(cleanup);

describe('RulesModal', () => {
  it('opens a dialog titled "Quick rules"', () => {
    render(<RulesModal open onClose={() => {}} />);

    expect(screen.getByRole('dialog', { name: RULES_COPY.title })).toBeTruthy();
  });

  it('closes from the close button', async () => {
    const onClose = vi.fn();
    render(<RulesModal open onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: RULES_COPY.closeLabel }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('lists all ten phases and highlights the current one', () => {
    render(<RulesModal open onClose={() => {}} currentPhase={4} />);

    const section = screen
      .getByRole('heading', { name: RULES_COPY.phasesTitle })
      .closest('section');
    const items = section === null ? [] : within(section).getAllByRole('listitem');
    expect(items).toHaveLength(PHASES.length);
    expect(items.map((item) => item.getAttribute('aria-current'))).toEqual(
      PHASES.map(({ phase }) => (phase === 4 ? 'step' : null))
    );
    expect(items[3]?.textContent).toContain(RULES_COPY.currentPhase);
  });

  it('highlights nothing without a current phase', () => {
    render(<RulesModal open onClose={() => {}} />);

    expect(screen.queryByText(RULES_COPY.currentPhase)).toBeNull();
  });

  it('shows the engine’s card points', () => {
    render(<RulesModal open onClose={() => {}} />);

    const section = screen
      .getByRole('heading', { name: RULES_COPY.pointsTitle })
      .closest('section');
    const items = section === null ? [] : within(section).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      '1–9 · 5',
      '10–12 · 10',
      'Skip · 15',
      'Wild · 25',
    ]);
  });
});
