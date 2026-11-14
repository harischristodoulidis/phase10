import { Link } from 'react-router';

import arrowLeftIcon from '@assets/icons/arrow-left.svg';
import { Icon } from '@ui/Icon';
import { Logo } from '@ui/Logo';

import { SETUP_COPY } from '../constants';

export function SetupHeader() {
  return (
    <header className="mx-auto grid max-w-[1160px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold text-link hover:text-link-hover"
      >
        <Icon src={arrowLeftIcon} />
        {SETUP_COPY.backLink}
      </Link>
      <Logo />
    </header>
  );
}
