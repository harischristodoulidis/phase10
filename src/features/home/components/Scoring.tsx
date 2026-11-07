import { SCORE_ROWS, SCORING_COPY, SECTION_IDS } from '../constants';
import { SectionHeading } from './SectionHeading';

export function Scoring() {
  return (
    <section id={SECTION_IDS.scoring} className="flex scroll-mt-6 flex-wrap gap-12">
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
        <SectionHeading>{SCORING_COPY.title}</SectionHeading>
        <p className="leading-relaxed text-body">{SCORING_COPY.intro}</p>
        <table className="w-full max-w-[420px] border-collapse">
          <caption className="sr-only">{SCORING_COPY.caption}</caption>
          <tbody>
            {SCORE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-line last:border-b-0">
                <th scope="row" className="py-3.5 text-left font-normal">
                  {row.label}
                </th>
                <td className="py-3.5 text-right font-semibold">{row.points} points</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
        <SectionHeading>{SCORING_COPY.winningTitle}</SectionHeading>
        {SCORING_COPY.winning.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-body">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
