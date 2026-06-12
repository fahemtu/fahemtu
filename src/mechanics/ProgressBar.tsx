// Fahemtu — Produit 1 : progression sobre (pas d'XP/score/streak).

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label="Progression"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10"
      >
        <div className="h-full bg-ocre" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-ink/50">
        {done}/{total}
      </span>
    </div>
  );
}
