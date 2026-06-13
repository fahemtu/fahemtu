// Fahemtu — Produit 1 : carte de parcours (accueil).
// 8 sessions avec leur état (verrouillée / disponible / complétée) + compteur
// « mots compris ». Déverrouillage progressif. Jalons sobres : aucun XP/streak.

import { useNavigation } from "../app/navigation-context";
import { useProgress } from "../app/progress-context";
import { SESSIONS } from "../content/sessions";
import { CheckIcon, LockIcon } from "../app/icons";
import { DEV_UNLOCK_ALL_PHASES } from "../config";

const TOTAL_WORDS = 67;
// Outils de dev visibles seulement en développement (jamais en prod).
const SHOW_DEV_TOOLS = import.meta.env.DEV || DEV_UNLOCK_ALL_PHASES;

export function JourneyMap() {
  const { navigate } = useNavigation();
  const { comprisCount, isCompleted, isUnlocked, reset } = useProgress();

  return (
    <div className="mx-auto w-full max-w-md px-5 py-8 sm:px-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Les mots qui débloquent l'arabe
        </h1>
        <div className="mt-6 rounded-2xl bg-white px-6 py-5 ring-1 ring-ink/10">
          <div className="text-4xl font-bold tabular-nums text-teal">
            {comprisCount}
            <span className="text-xl text-ink/30"> / {TOTAL_WORDS}</span>
          </div>
          <p className="mt-1 text-sm text-ink/60">mots compris à l'oreille</p>
        </div>
      </header>

      <ol className="mt-8 space-y-3">
        {SESSIONS.map((s) => {
          const completed = isCompleted(s.id);
          const unlocked = isUnlocked(s.id);
          const locked = !unlocked;

          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => navigate({ name: "session", sessionId: s.id })}
                className={`flex w-full touch-manipulation select-none items-center gap-4 rounded-2xl px-4 py-4 text-left ring-1 transition-none ${
                  locked
                    ? "bg-ink/[0.03] ring-ink/10 opacity-60"
                    : "bg-white ring-ink/10 hover:ring-ocre/60"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    completed
                      ? "bg-teal text-creme"
                      : locked
                        ? "bg-ink/10 text-ink/40"
                        : "bg-ocre/15 text-ocre"
                  }`}
                >
                  {completed ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : locked ? (
                    <LockIcon className="h-4 w-4" />
                  ) : (
                    s.id
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-ink/40">
                    Session {s.id}
                  </span>
                  <span className="block truncate font-medium text-ink">
                    {s.title}
                  </span>
                </span>

                <span className="shrink-0 text-xs font-medium text-ink/50">
                  {completed ? "Revoir" : locked ? "Verrouillée" : "Commencer"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 border-t border-ink/10 pt-4 text-center">
        <button
          type="button"
          onClick={() => navigate({ name: "onboarding" })}
          className="text-xs font-medium text-ink/50 hover:text-ink/80"
        >
          Revoir l'introduction
        </button>
        {SHOW_DEV_TOOLS && (
          <>
            <button
              type="button"
              onClick={reset}
              className="ml-4 text-xs font-medium text-ink/40 hover:text-ink/70"
            >
              dev · réinitialiser la progression
            </button>
            <button
              type="button"
              onClick={() => navigate({ name: "proofEnd" })}
              className="ml-4 text-xs font-medium text-ink/40 hover:text-ink/70"
            >
              dev · écran de fin de preuve
            </button>
          </>
        )}
      </div>
    </div>
  );
}
