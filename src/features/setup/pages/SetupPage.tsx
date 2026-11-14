import { useAppDispatch, useAppSelector } from '@app/hooks';

import { Card } from '@ui/Card';
import { SegmentedControl } from '@ui/SegmentedControl';

import { PlayerNameList } from '../components/PlayerNameList';
import { SetupHeader } from '../components/SetupHeader';
import { StartGameButton } from '../components/StartGameButton';
import { PLAYER_COUNTS, SETUP_COPY } from '../constants';
import { selectActiveNames, selectPlayerCount } from '../selectors';
import { playerCountChanged, playerNameChanged } from '../setupSlice';

const COUNT_HEADING_ID = 'setup-count-heading';
const NAMES_HEADING_ID = 'setup-names-heading';

export function SetupPage() {
  const dispatch = useAppDispatch();
  const playerCount = useAppSelector(selectPlayerCount);
  const names = useAppSelector(selectActiveNames);
  const firstPlayer = names[0]?.trim() || SETUP_COPY.placeholder(1);

  return (
    <>
      <title>{SETUP_COPY.pageTitle}</title>
      <SetupHeader />
      <main className="mx-auto flex max-w-[720px] flex-col gap-7 px-6 pt-6 pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[40px] leading-tight font-bold tracking-[-0.01em] text-ink sm:text-5xl">
            {SETUP_COPY.title}
          </h1>
          <p className="text-[17px] text-muted">{SETUP_COPY.intro}</p>
        </div>
        <Card as="section" padding="lg" className="gap-4">
          <h2 id={COUNT_HEADING_ID} className="text-lg font-bold text-ink">
            {SETUP_COPY.countHeading}
          </h2>
          <SegmentedControl
            options={PLAYER_COUNTS}
            value={playerCount}
            labelledBy={COUNT_HEADING_ID}
            onChange={(count) => dispatch(playerCountChanged(count))}
          />
        </Card>
        <Card as="section" padding="lg" className="gap-4">
          <h2 id={NAMES_HEADING_ID} className="text-lg font-bold text-ink">
            {SETUP_COPY.namesHeading}
          </h2>
          <PlayerNameList
            names={names}
            labelledBy={NAMES_HEADING_ID}
            onNameChange={(seat, name) => dispatch(playerNameChanged({ seat, name }))}
          />
          <p className="text-sm text-muted">{SETUP_COPY.orderNote}</p>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[15px] text-muted">{SETUP_COPY.summary(playerCount, firstPlayer)}</p>
          <StartGameButton />
        </div>
      </main>
    </>
  );
}
