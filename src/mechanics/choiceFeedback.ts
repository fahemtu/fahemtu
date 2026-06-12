// Fahemtu — Produit 1 : feedback correctif partagé par les mécaniques à choix.
// Cohérence d'expérience : sur réussite, liseré teal + enchaînement rapide ;
// sur erreur, liseré rouge sur le choix fautif + révélation teal de la bonne
// réponse, avec un délai plus long pour la voir. La révélation arrive APRÈS la
// tentative (anti-spectateur). Utilisé par M1/M2 (audio↔image), M3 (tri), M4 (sprint).

import { useCallback, useEffect, useRef, useState } from "react";
import { ADVANCE_MS, REVEAL_MS } from "./types";

export type ChoiceStatus = "idle" | "correct" | "wrong";

export interface ChoiceFeedback {
  status: ChoiceStatus;
  /** Identifiant (slug ou cluster) choisi par l'apprenant, ou null (timeout). */
  chosen: string | null;
  /** Vrai pendant le feedback : ignorer les nouveaux clics. */
  locked: boolean;
  /** Enregistre le choix puis enchaîne après le délai (court si correct). */
  resolve: (chosenId: string | null, correct: boolean) => void;
}

export function useChoiceFeedback(
  onResolved: (correct: boolean) => void,
): ChoiceFeedback {
  const [status, setStatus] = useState<ChoiceStatus>("idle");
  const [chosen, setChosen] = useState<string | null>(null);
  const lockedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const onResolvedRef = useRef(onResolved);

  // Garde la dernière callback sans la lire pendant le render.
  useEffect(() => {
    onResolvedRef.current = onResolved;
  });

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const resolve = useCallback((chosenId: string | null, correct: boolean) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setChosen(chosenId);
    setStatus(correct ? "correct" : "wrong");
    timerRef.current = window.setTimeout(
      () => {
        setStatus("idle");
        setChosen(null);
        lockedRef.current = false;
        onResolvedRef.current(correct);
      },
      correct ? ADVANCE_MS : REVEAL_MS,
    );
  }, []);

  return { status, chosen, locked: status !== "idle", resolve };
}

/**
 * Classe de liseré d'une option, selon le feedback.
 * `id` = identifiant de l'option ; `correctId` = la bonne réponse.
 */
export function choiceRing(
  id: string,
  correctId: string,
  status: ChoiceStatus,
  chosen: string | null,
): string {
  if (status === "idle") return "ring-ink/10 hover:ring-ocre/60";
  if (id === chosen)
    return status === "correct" ? "ring-2 ring-teal" : "ring-2 ring-[#D64541]";
  // Révélation corrective : la bonne réponse passe en teal sur erreur.
  if (status === "wrong" && id === correctId) return "ring-2 ring-teal";
  return "ring-ink/10 opacity-60";
}
