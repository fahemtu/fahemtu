// Fahemtu — Produit 1 : découverte d'un nouveau mot.
// Présentation SIMULTANÉE audio (arabe) + image, jamais par du texte (§0.5).
// Micro-interaction de fixation : l'audio rejoue au tap sur l'image ; on avance
// quand l'apprenant le décide. Aucun texte arabe ni traduction FR.

import { useEffect, useRef, useState } from "react";
import { useSound } from "../app/sound-context";
import { WordImage } from "../ui/WordImage";
import { SpeakerIcon } from "../app/icons";
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
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-6">
      <p className="text-center text-sm font-medium text-ink/60">
        Écoute et observe — nouveau mot {index + 1}/{words.length}
      </p>

      <button
        type="button"
        onClick={() => play(word.audio)}
        aria-label="Réécouter"
        className="mx-auto mt-8 aspect-square w-64 max-w-full overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-ink/10 hover:ring-ocre/60"
      >
        <WordImage word={word} />
      </button>

      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink/40">
          <SpeakerIcon className="h-4 w-4" />
          Touche l'image pour réécouter
        </span>
      </div>

      <div className="mt-auto flex justify-center pt-8">
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
    </div>
  );
}
