import type { Group } from '@features/game-engine';

import { groupLabel, hitLabel } from '../hitAction';
import { dropZoneClasses, useDropZone } from '../hooks/useDropZone';
import type { TurnState } from '../hooks/useTurnState';
import { GroupCards } from './GroupCards';
import { TapTarget } from './TapTarget';

type GroupTargetProps = {
  turn: TurnState;
  group: Group;
  owner: string | null;
  variant: 'slot' | 'tile';
};

const VARIANTS = {
  slot: { box: 'min-h-[120px] gap-2.5 rounded-2xl p-3.5', idle: 'border-table-line', size: 'slot' },
  tile: { box: '-mx-2 gap-1.5 rounded-xl px-2 py-1.5', idle: 'border-transparent', size: 'sm' },
} as const;

// A laid-down group, yours or another player's: drop or tap a card here to hit it.
export function GroupTarget({ turn, group, owner, variant }: GroupTargetProps) {
  const { dropRef, tapResolution, ...highlight } = useDropZone(turn, `group-${group.id}`, {
    kind: 'group',
    groupId: group.id,
  });
  const style = VARIANTS[variant];

  return (
    <div
      ref={dropRef}
      className={`relative flex flex-col border-2 border-dashed transition-colors ${style.box} ${dropZoneClasses(highlight, style.idle)}`}
    >
      <span className="text-[13px] text-table-muted">{groupLabel(group)}</span>
      <GroupCards cards={group.cards} size={style.size} />
      <TapTarget
        resolution={tapResolution?.kind === 'move' ? tapResolution : null}
        label={hitLabel(turn.selected, group, owner)}
        onTap={() => turn.tapZone({ kind: 'group', groupId: group.id })}
      />
    </div>
  );
}
