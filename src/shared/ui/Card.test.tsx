import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Badge } from './Badge';
import { Card } from './Card';

afterEach(cleanup);

describe('Card', () => {
  it('renders a div by default', () => {
    render(<Card>Content</Card>);

    expect(screen.getByText('Content').tagName).toBe('DIV');
  });

  it('renders the chosen element', () => {
    render(
      <ul>
        <Card as="li" variant="outlined">
          Item
        </Card>
      </ul>
    );

    expect(screen.getByRole('listitem').textContent).toBe('Item');
  });

  it('passes id and aria-labelledby through', () => {
    render(
      <Card as="section" id="rules" aria-labelledby="rules-title">
        <h2 id="rules-title">Rules</h2>
      </Card>
    );

    expect(screen.getByRole('region', { name: 'Rules' }).id).toBe('rules');
  });
});

describe('Badge', () => {
  it('renders its label as plain text', () => {
    render(<Badge size="sm">Deals first</Badge>);

    expect(screen.getByText('Deals first').tagName).toBe('SPAN');
  });
});
