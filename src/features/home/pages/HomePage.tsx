import { HOME_COPY } from '../constants';

export function HomePage() {
  return (
    <main className="mx-auto flex max-w-[1160px] flex-col gap-4 px-6 py-16">
      <h1 className="font-display text-5xl font-bold tracking-tight text-ink sm:text-7xl">
        {HOME_COPY.title}
      </h1>
      <p className="max-w-[640px] text-lg text-body">{HOME_COPY.intro}</p>
    </main>
  );
}
