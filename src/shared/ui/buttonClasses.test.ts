import { describe, expect, it } from 'vite-plus/test';

import { buttonClasses } from './buttonClasses';

describe('buttonClasses', () => {
  it('uses ink for primary on light chrome and blue on dark', () => {
    expect(buttonClasses({ variant: 'primary' })).toContain('bg-ink');
    expect(buttonClasses({ variant: 'primary', onDark: true })).toContain('bg-card-blue');
  });

  it('applies the size classes', () => {
    expect(buttonClasses({ size: 'sm' })).toContain('min-h-11');
    expect(buttonClasses({ size: 'lg' })).toContain('min-h-14');
  });

  it('uses the table disabled look on dark', () => {
    expect(buttonClasses({ onDark: true })).toContain('disabled:text-table-disabled');
    expect(buttonClasses()).toContain('disabled:opacity-50');
  });
});
