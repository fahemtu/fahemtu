// Fahemtu — Produit 1 : résumé inter-session (sobre, §7/§8).
// Met à jour « mots compris ». Aucun score, étoile ni confetti.

import { useNavigation } from "../app/navigation-context";
import { useProgress } from "../app/progress-context";
import { SESSIONS } from "../content/sessions";

const TOTAL_WORDS = 67;

export function Summary({ sessionId }: { sessionId: number }) {
  const { navigate, goHome } = useNavigation();
  const { comprisCount, isUnlocked } = useProgress();

  const nextSession = SESSIONS.find((s) => s.id === sessionId + 1);
  const canContinue = nextSession && isUnlocked(nextSession.id);

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-6 overflow-y-auto px-5 py-10 text-center sm:px-6 sm:py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-ocre">
        Session {sessionId} terminée
      </p>

      <div className="rounded-2xl bg-white px-8 py-6 ring-1 ring-ink/10">
        <div className="text-5xl font-bold tabular-nums text-teal">
          {comprisCount}
          <span className="text-2xl text-ink/30"> / {TOTAL_WORDS}</span>
        </div>
        <p className="mt-2 text-ink/70">mots compris à l'oreille</p>
      </div>

      <div className="mt-2 flex flex-col items-stretch gap-3">
        {canContinue && (
          <button
            type="button"
            onClick={() => navigate({ name: "session", sessionId: nextSession.id })}
            className="rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
          >
            Session suivante
          </button>
        )}
        <button
          type="button"
          onClick={goHome}
          className="rounded-xl px-6 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5"
        >
          Retour à la carte
        </button>
      </div>
    </div>
  );
}
