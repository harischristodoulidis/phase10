import { Link } from 'react-router';

import arrowLeftIcon from '@assets/icons/arrow-left.svg';
import { Icon } from '@ui/Icon';

import { SETUP_COPY } from '../constants';

export function SetupHeader() {
  return (
    <header className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-5">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-link hover:text-link-hover"
      >
        <Icon src={arrowLeftIcon} />
        {SETUP_COPY.backLink}
      </Link>
      <span className="font-display text-[22px] font-bold text-ink">{SETUP_COPY.wordmark}</span>
      <span aria-hidden="true" className="w-[70px]" />
    </header>
  );
}
