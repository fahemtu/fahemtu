// Fahemtu — Produit 1 : M3, tri par catégorie (clusters).
// On joue un mot ; l'apprenant le dépose dans le bon cluster. Comprendre le mot
// entendu EST l'acte de compréhension. Catégories = libellé FR + icône (chrome).
// Aucun texte arabe, aucune traduction FR du mot ; stimulus = audio seul.

import { useEffect, useMemo, useRef } from "react";
import { useSound } from "../app/sound-context";
import { SpeakerIcon } from "../app/icons";
import { ClusterIcon } from "../ui/ClusterIcon";
import { CLUSTER_LABEL, CLUSTER_ORDER } from "../content/clusters";
import type { Cluster } from "../content/words";
import { type MechanicProps } from "./types";
import { useRetrievalQueue } from "./useRetrievalQueue";
import { choiceRing, useChoiceFeedback } from "./choiceFeedback";
import { ProgressBar } from "./ProgressBar";
import { FitGrid, SessionLayout } from "./layout";

export function Tri({ words, pool, onComplete, onWordMastered }: MechanicProps) {
  const { play } = useSound();
  const { current, step, progress, advance } = useRetrievalQueue(words, onComplete);
  const { status, chosen, locked, resolve } = useChoiceFeedback(advance);

  // Catégories proposées = clusters présents parmi les mots introduits (pool).
  const categories = useMemo<Cluster[]>(() => {
    const present = new Set(pool.map((w) => w.cluster));
    return CLUSTER_ORDER.filter((c) => present.has(c));
  }, [pool]);

  // Lecture de l'audio à chaque item.
  const playedRef = useRef(-1);
  useEffect(() => {
    if (!current || playedRef.current === step) return;
    playedRef.current = step;
    play(current.audio);
  }, [current, step, play]);

  if (!current) return null;
  const correctCluster = current.cluster;

  return (
    <SessionLayout>
      <div className="shrink-0">
        <ProgressBar done={progress.done} total={progress.total} />
      </div>

      <p className="mt-4 shrink-0 text-center text-sm font-medium text-ink/60">
        Écoute, puis range le mot dans sa catégorie.
      </p>

      <div className="mt-3 flex shrink-0 justify-center">
        <button
          type="button"
          onClick={() => play(current.audio)}
          aria-label="Réécouter"
          className="grid h-16 w-16 place-items-center rounded-full bg-teal text-creme hover:opacity-90"
        >
          <SpeakerIcon className="h-7 w-7" />
        </button>
      </div>

      <FitGrid count={categories.length} cols={2} square={false}>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            disabled={locked}
            onClick={() => {
              const correct = c === correctCluster;
              if (correct) onWordMastered?.(current.slug);
              resolve(c, correct);
            }}
            className={`flex min-h-0 touch-manipulation select-none items-center gap-3 overflow-hidden rounded-2xl bg-white px-4 text-left ring-1 ${choiceRing(
              c,
              correctCluster,
              status,
              chosen,
            )}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-creme text-teal">
              <ClusterIcon cluster={c} className="h-6 w-6" />
            </span>
            <span className="font-medium text-ink">{CLUSTER_LABEL[c]}</span>
          </button>
        ))}
      </FitGrid>
    </SessionLayout>
  );
}
