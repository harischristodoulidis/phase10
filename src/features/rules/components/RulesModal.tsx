import type { PhaseNumber } from '@features/game-engine';

import { Modal } from '@ui/Modal';

import { RULES_COPY } from '../constants';
import { GoodToKnow } from './GoodToKnow';
import { PointsGrid } from './PointsGrid';
import { QuickPhaseList } from './QuickPhaseList';
import { QuickTurnSteps } from './QuickTurnSteps';

type RulesModalProps = {
  open: boolean;
  onClose: () => void;
  currentPhase?: PhaseNumber | null;
};

export function RulesModal({ open, onClose, currentPhase = null }: RulesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={RULES_COPY.title}
      closeLabel={RULES_COPY.closeLabel}
    >
      <p className="text-sm text-muted">{RULES_COPY.pausedNote}</p>
      <QuickTurnSteps />
      <QuickPhaseList currentPhase={currentPhase} />
      <GoodToKnow />
      <PointsGrid />
    </Modal>
  );
}
