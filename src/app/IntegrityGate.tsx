// Fahemtu — Produit 1 : garde d'intégrité au démarrage (§9).
// Exécute le check des données une fois. En DEV, bloque avec un écran explicite
// si une erreur est trouvée (surface dev/admin). En PROD, journalise et laisse
// passer (la logique de distracteurs garantit par ailleurs de ne jamais planter).

import { useMemo, type ReactNode } from "react";
import { checkContentIntegrity } from "../content/integrity";

export function IntegrityGate({ children }: { children: ReactNode }) {
  const result = useMemo(() => checkContentIntegrity(), []);

  for (const w of result.warnings) console.warn("[intégrité]", w);
  if (!result.ok) {
    for (const e of result.errors) console.error("[intégrité]", e);
  }

  if (!result.ok && import.meta.env.DEV) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-xl font-bold text-ink">
          Intégrité du contenu : {result.errors.length} erreur(s)
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Corrige le contenu avant de continuer (écran dev uniquement).
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink">
          {result.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
        {result.warnings.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ocre">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
