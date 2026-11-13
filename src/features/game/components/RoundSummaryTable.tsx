import { ROUND_COPY } from '../constants';
import { outcomeText, type RoundSummary } from '../roundSummary';
import { ResultRow } from './ResultRow';
import { SummaryTable } from './SummaryTable';

type RoundSummaryTableProps = {
  round: number;
  summary: RoundSummary;
  onDeal: () => void;
};

export function RoundSummaryTable({ round, summary, onDeal }: RoundSummaryTableProps) {
  const { tiedPlayers, nextDealer } = summary;
  const isTiebreak = tiedPlayers.length > 0;

  return (
    <SummaryTable
      status={ROUND_COPY.status(round)}
      title={isTiebreak ? ROUND_COPY.tieTitle : ROUND_COPY.title(summary.wentOut.name)}
      subtitle={
        isTiebreak
          ? ROUND_COPY.tieDetails(
              tiedPlayers.map((player) => player.name),
              tiedPlayers.length < summary.results.length
            )
          : ROUND_COPY.details(nextDealer.name, round + 1)
      }
      listTitle={ROUND_COPY.resultsTitle}
      actionLabel={isTiebreak ? ROUND_COPY.tieAction : ROUND_COPY.action(round + 1)}
      onAction={onDeal}
      hint={ROUND_COPY.hint}
    >
      {summary.results.map((result) => (
        <ResultRow
          key={result.player.id}
          player={result.player}
          badge={result.wentOut ? ROUND_COPY.wentOut : null}
          detail={outcomeText(result.outcome)}
          value={ROUND_COPY.points(result.points)}
          valueLabel={ROUND_COPY.pointsLabel}
          caption={ROUND_COPY.total(result.player.score)}
        />
      ))}
    </SummaryTable>
  );
}
