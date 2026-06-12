// Fahemtu — Produit 1 : file de récupération partagée par les mécaniques à items.
// Réussite → l'item sort de la file. Erreur → l'item revient PLUS LOIN dans la
// file (pas de révélation de la bonne réponse, pas de nouvelle tentative
// immédiate). Le bloc se termine quand chaque mot a été réussi au moins une fois.

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Word } from "../content/words";
import { wordBySlug } from "../content/words";
import { shuffle } from "../lib/shuffle";

/** Écart de réinsertion d'un mot raté (revient « plus loin »). */
const REQUEUE_GAP = 3;

interface State {
  queue: string[];
  mastered: Set<string>;
  step: number;
}

function reducer(state: State, correct: boolean): State {
  if (state.queue.length === 0) return state;
  const [head, ...rest] = state.queue;
  if (correct) {
    const mastered = new Set(state.mastered);
    mastered.add(head);
    return { queue: rest, mastered, step: state.step + 1 };
  }
  const pos = Math.min(rest.length, REQUEUE_GAP);
  const queue = [...rest.slice(0, pos), head, ...rest.slice(pos)];
  return { queue, mastered: state.mastered, step: state.step + 1 };
}

export interface RetrievalQueue {
  /** Mot courant (tête de file), ou null quand le bloc est terminé. */
  current: Word | null;
  /** Change à chaque nouvel item — sert à régénérer les options/audio. */
  step: number;
  /** Progression sobre : mots maîtrisés / total. */
  progress: { done: number; total: number };
  /** Enchaîne après le feedback : retire (réussite) ou réinsère (erreur). */
  advance: (correct: boolean) => void;
}

export function useRetrievalQueue(
  words: Word[],
  onComplete: () => void,
): RetrievalQueue {
  const total = words.length;
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    queue: shuffle(words.map((w) => w.slug)),
    mastered: new Set<string>(),
    step: 0,
  }));

  const advance = useCallback((correct: boolean) => dispatch(correct), []);

  // Complétion détectée hors render (file vidée), une seule fois.
  const doneRef = useRef(false);
  useEffect(() => {
    if (total > 0 && state.queue.length === 0 && !doneRef.current) {
      doneRef.current = true;
      onComplete();
    }
  }, [state.queue.length, total, onComplete]);

  const current =
    state.queue.length > 0 ? wordBySlug[state.queue[0]] ?? null : null;

  return {
    current,
    step: state.step,
    progress: { done: state.mastered.size, total },
    advance,
  };
}
