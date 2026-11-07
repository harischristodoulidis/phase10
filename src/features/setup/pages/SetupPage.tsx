import { Link } from 'react-router';

import { useAppDispatch, useAppSelector } from '@app/hooks';

import { Card } from '@ui/Card';
import { SegmentedControl } from '@ui/SegmentedControl';

import { PlayerNameList } from '../components/PlayerNameList';
import { PLAYER_COUNTS, SETUP_COPY } from '../constants';
import { selectActiveNames, selectPlayerCount } from '../selectors';
import { playerCountChanged, playerNameChanged } from '../setupSlice';

const COUNT_HEADING_ID = 'setup-count-heading';
const NAMES_HEADING_ID = 'setup-names-heading';

export function SetupPage() {
  const dispatch = useAppDispatch();
  const playerCount = useAppSelector(selectPlayerCount);
  const names = useAppSelector(selectActiveNames);

  return (
    <main className="mx-auto flex max-w-[720px] flex-col gap-6 px-4 py-10 sm:px-6">
      <title>{SETUP_COPY.pageTitle}</title>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-link hover:text-link-hover"
      >
        <span aria-hidden="true">←</span>
        {SETUP_COPY.backLink}
      </Link>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
        {SETUP_COPY.title}
      </h1>
      <Card as="section" padding="lg" className="gap-4">
        <h2 id={COUNT_HEADING_ID} className="font-display text-xl font-bold">
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
        <h2 id={NAMES_HEADING_ID} className="font-display text-xl font-bold">
          {SETUP_COPY.namesHeading}
        </h2>
        <PlayerNameList
          names={names}
          labelledBy={NAMES_HEADING_ID}
          onNameChange={(seat, name) => dispatch(playerNameChanged({ seat, name }))}
        />
      </Card>
    </main>
  );
}
