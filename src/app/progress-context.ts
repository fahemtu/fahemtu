// Fahemtu — Produit 1 : contexte de progression (types + hook).
// Séparé du Provider pour le fast-refresh.

import { createContext, useContext } from "react";

export interface ProgressValue {
  /** Ids des sessions complétées (terminées de bout en bout). */
  completedSessions: ReadonlySet<number>;
  /** Slugs récupérés correctement au moins une fois. */
  masteredWords: ReadonlySet<string>;
  /** Compteur « mots compris » = nombre de mots maîtrisés. */
  comprisCount: number;
  isCompleted: (sessionId: number) => boolean;
  /** Déverrouillée si 1re session, précédente complétée, ou dev-unlock. */
  isUnlocked: (sessionId: number) => boolean;
  /** Marque un mot maîtrisé (idempotent). */
  recordMastered: (slug: string) => void;
  /** Marque une session complétée (idempotent). */
  completeSession: (sessionId: number) => void;
}

export const ProgressContext = createContext<ProgressValue | null>(null);

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress doit être utilisé dans <ProgressProvider>");
  return ctx;
}
