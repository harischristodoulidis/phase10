import { Fragment } from 'react';

import { Link } from 'react-router';

import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { buttonClasses } from '@ui/buttonClasses';
import { Icon } from '@ui/Icon';

import { HOME_COPY, SECTION_IDS } from '../constants';
import { HeroCards } from './HeroCards';

export function Hero() {
  return (
    <section className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-12 px-6 pt-10 pb-18">
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
        <p className="text-sm font-semibold tracking-[0.08em] text-muted uppercase">
          {HOME_COPY.eyebrow}
        </p>
        <h1 className="font-display text-5xl leading-none font-bold tracking-[-0.02em] text-ink sm:text-7xl">
          {HOME_COPY.titleLines.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && ' '}
              <span className="block">{line}</span>
            </Fragment>
          ))}
        </h1>
        <p className="max-w-[540px] text-[19px] leading-relaxed text-body">{HOME_COPY.intro}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/setup" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            {HOME_COPY.setupCta}
            <Icon src={arrowRightIcon} />
          </Link>
          <a
            href={`#${SECTION_IDS.how}`}
            className={buttonClasses({ variant: 'ghost', size: 'lg' })}
          >
            {HOME_COPY.rulesLink}
          </a>
        </div>
      </div>
      <HeroCards />
    </section>
  );
}
