// Fahemtu — Produit 1 : progression persistée (localStorage, §8).
// Persiste : sessions complétées, mots maîtrisés. Le compteur « mots compris »
// en découle. Déverrouillage progressif (une session s'ouvre quand la
// précédente est complétée) ; DEV_UNLOCK_ALL_PHASES ouvre tout.
// Jalons sobres : aucun XP / vie / streak / ligue.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEV_UNLOCK_ALL_PHASES, STORAGE_KEY } from "../config";
import { ProgressContext, type ProgressValue } from "./progress-context";

interface Stored {
  completed: number[];
  mastered: string[];
}

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], mastered: [] };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      mastered: Array.isArray(parsed.mastered) ? parsed.mastered : [],
    };
  } catch {
    return { completed: [], mastered: [] };
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Init paresseux : lecture localStorage une seule fois.
  const [store, setStore] = useState<Stored>(load);
  const { completed, mastered } = store;

  // Persistance à chaque changement.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* stockage indisponible : on garde l'état en mémoire */
    }
  }, [store]);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const masteredSet = useMemo(() => new Set(mastered), [mastered]);

  const recordMastered = useCallback((slug: string) => {
    setStore((s) =>
      s.mastered.includes(slug) ? s : { ...s, mastered: [...s.mastered, slug] },
    );
  }, []);

  const completeSession = useCallback((sessionId: number) => {
    setStore((s) =>
      s.completed.includes(sessionId)
        ? s
        : { ...s, completed: [...s.completed, sessionId] },
    );
  }, []);

  const isCompleted = useCallback(
    (sessionId: number) => completedSet.has(sessionId),
    [completedSet],
  );

  const isUnlocked = useCallback(
    (sessionId: number) =>
      DEV_UNLOCK_ALL_PHASES || sessionId <= 1 || completedSet.has(sessionId - 1),
    [completedSet],
  );

  const value = useMemo<ProgressValue>(
    () => ({
      completedSessions: completedSet,
      masteredWords: masteredSet,
      comprisCount: masteredSet.size,
      isCompleted,
      isUnlocked,
      recordMastered,
      completeSession,
    }),
    [completedSet, masteredSet, isCompleted, isUnlocked, recordMastered, completeSession],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}
