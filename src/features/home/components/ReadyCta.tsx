import { Link } from 'react-router';

import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { buttonClasses } from '@ui/buttonClasses';
import { Icon } from '@ui/Icon';

import { CTA_COPY, HOME_COPY } from '../constants';

export function ReadyCta() {
  return (
    <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-ink p-8 text-white focus-ring-dark sm:p-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-[34px] leading-tight font-bold">{CTA_COPY.title}</h2>
        <p className="text-table-soft">{CTA_COPY.body}</p>
      </div>
      <Link to="/setup" className={buttonClasses({ variant: 'inverse', size: 'lg' })}>
        {HOME_COPY.setupCta}
        <Icon src={arrowRightIcon} />
      </Link>
    </section>
  );
}
