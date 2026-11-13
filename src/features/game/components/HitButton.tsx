import { Button } from '@ui/Button';

import { TURN_COPY } from '../constants';
import type { HitAction } from '../hitAction';

type HitButtonProps = {
  hit: HitAction | null;
};

export function HitButton({ hit }: HitButtonProps) {
  if (hit === null) {
    return null;
  }
  return (
    <Button variant="secondary" size="sm" onDark onClick={hit.onHit}>
      {TURN_COPY.hitButton}
      <span className="sr-only">: {hit.label}</span>
    </Button>
  );
}
