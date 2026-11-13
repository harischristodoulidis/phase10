import { Button } from '@ui/Button';

type InterimScreenProps = {
  title: string;
  message: string | null;
  actionLabel: string;
  onAction: () => void;
};

// A plain stand-in for the round summary and game over screens until they are designed.
export function InterimScreen({ title, message, actionLabel, onAction }: InterimScreenProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center gap-6 px-6 text-center">
      <title>{`${title} · Phase 10`}</title>
      <h1 className="font-display text-[40px] leading-tight font-bold">{title}</h1>
      {message !== null && message !== '' && <p className="text-[17px] text-muted">{message}</p>}
      <Button size="lg" onClick={onAction}>
        {actionLabel}
      </Button>
    </main>
  );
}
