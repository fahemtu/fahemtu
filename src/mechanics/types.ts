// Fahemtu — Produit 1 : contrat commun des mécaniques.
// Chaque mécanique reçoit les mots à travailler (`words`) et un `pool` de mots
// déjà introduits utilisables comme distracteurs (§3, §4). Elle appelle
// `onComplete` quand son bloc est terminé.

import type { Word } from "../content/words";

export interface MechanicProps {
  /** Mots cibles à travailler dans ce bloc. */
  words: Word[];
  /** Mots déjà introduits, utilisables comme distracteurs (inclut `words`). */
  pool: Word[];
  /** Appelé quand tous les items du bloc ont été réussis au moins une fois. */
  onComplete: () => void;
}

/** Délai d'enchaînement après réponse (le feedback visuel, lui, est immédiat). */
export const ADVANCE_MS = 250;
