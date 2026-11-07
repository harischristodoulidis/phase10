import { CardsOverview } from '../components/CardsOverview';
import { Hero } from '../components/Hero';
import { HomeHeader } from '../components/HomeHeader';
import { HowToPlay } from '../components/HowToPlay';
import { PhaseList } from '../components/PhaseList';
import { ReadyCta } from '../components/ReadyCta';
import { Scoring } from '../components/Scoring';
import { HOME_COPY } from '../constants';

export function HomePage() {
  return (
    <>
      <title>{HOME_COPY.pageTitle}</title>
      <HomeHeader />
      <main>
        <Hero />
        <div className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-20 px-6 py-18">
            <HowToPlay />
            <CardsOverview />
            <PhaseList />
            <Scoring />
            <ReadyCta />
          </div>
        </div>
      </main>
    </>
  );
}
