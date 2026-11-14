import { Logo } from '@ui/Logo';

import { NAV_LINKS } from '../constants';

export function HomeHeader() {
  return (
    <header className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 px-6 py-5">
      <Logo />
      <nav aria-label="Sections" className="flex flex-wrap gap-x-5 text-[15px] font-medium">
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="inline-flex min-h-11 items-center text-link hover:text-link-hover"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
