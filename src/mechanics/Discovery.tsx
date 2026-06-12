// Fahemtu — Produit 1 : découverte d'un nouveau mot.
// Présentation SIMULTANÉE audio (arabe) + image, jamais par du texte (§0.5).
// Micro-interaction de fixation : l'audio rejoue au tap sur l'image ; on avance
// quand l'apprenant le décide. Aucun texte arabe ni traduction FR.

import { useEffect, useRef, useState } from "react";
import { useSound } from "../app/sound-context";
import { WordImage } from "../ui/WordImage";
import { SpeakerIcon } from "../app/icons";
import { SessionLayout } from "./layout";
import type { Word } from "../content/words";

export function Discovery({
  words,
  onComplete,
}: {
  words: Word[];
  onComplete: () => void;
}) {
  const { play } = useSound();
  const [index, setIndex] = useState(0);
  const word = words[index];

  // Joue l'audio à l'apparition de chaque mot (présentation simultanée).
  const playedRef = useRef(-1);
  useEffect(() => {
    if (!word) return;
    if (playedRef.current === index) return;
    playedRef.current = index;
    play(word.audio);
  }, [index, word, play]);

  if (!word) return null;

  const last = index === words.length - 1;

  return (
    <SessionLayout>
      <p className="shrink-0 text-center text-sm font-medium text-ink/60">
        Écoute et observe — nouveau mot {index + 1}/{words.length}
      </p>

      {/* Bloc image + légende, centré verticalement dans l'espace disponible. */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        {/* Zone-conteneur : permet de calculer le côté du carré en fonction de
            la hauteur ET de la largeur disponibles (unités cqh/cqw). */}
        <div
          className="flex min-h-0 w-full flex-1 items-center justify-center"
          style={{ containerType: "size" }}
        >
          <button
            type="button"
            onClick={() => play(word.audio)}
            aria-label="Réécouter"
            // Carré = min(largeur dispo, hauteur dispo, 400px) → rétrécit sur
            // petit écran, ne ballonne pas sur grand écran.
            style={{ width: "min(100cqw, 100cqh, 400px)" }}
            className="aspect-square touch-manipulation select-none overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-ink/10 hover:ring-ocre/60"
          >
            <WordImage word={word} />
          </button>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink/40">
          <SpeakerIcon className="h-4 w-4" />
          Touche l'image pour réécouter
        </span>
      </div>

      {/* « Suivant » à distance normale, non plaqué au bas de l'écran. */}
      <div className="mt-4 flex shrink-0 justify-center">
        <button
          type="button"
          onClick={() => {
            if (last) onComplete();
            else setIndex((i) => i + 1);
          }}
          className="rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
        >
          {last ? "Commencer les exercices" : "Suivant"}
        </button>
      </div>
    </SessionLayout>
  );
}
