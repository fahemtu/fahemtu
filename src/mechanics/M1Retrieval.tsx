// Fahemtu — Produit 1 : M1, récupération audio ↔ image (cœur, 2 directions).
//
// ORAL-ONLY : aucun texte arabe, aucune traduction FR. Le sens passe par
// l'audio (arabe) et l'image. Le seul texte est du chrome (consigne générique).
//
//   audio_to_image : on joue l'audio ; choisir l'image (4 options).
//   image_to_audio : on montre l'image ; choisir le bon son (3 boutons son).
//
// Erreur → feedback bref, pas de révélation ; le mot revient plus loin (file).

import { useEffect, useMemo, useRef, useState } from "react";
import { useSound } from "../app/sound-context";
import { SpeakerIcon } from "../app/icons";
import { WordImage } from "../ui/WordImage";
import { buildOptions } from "../lib/distractors";
import { ADVANCE_MS, type MechanicProps } from "./types";
import { useRetrievalQueue } from "./useRetrievalQueue";

type Direction = "audio_to_image" | "image_to_audio";

const OPTION_COUNT: Record<Direction, number> = {
  audio_to_image: 4,
  image_to_audio: 3,
};

const CONSIGNE: Record<Direction, string> = {
  audio_to_image: "Écoute, puis choisis l'image.",
  image_to_audio: "Regarde l'image, puis choisis le bon son.",
};

type Status = "idle" | "correct" | "wrong";

export function M1Retrieval({
  words,
  pool,
  onComplete,
  direction,
}: MechanicProps & { direction: Direction }) {
  const { play } = useSound();
  const { current, step, progress, advance } = useRetrievalQueue(words, onComplete);

  const options = useMemo(
    () => (current ? buildOptions(current, pool, OPTION_COUNT[direction]) : []),
    // Régénéré à chaque item (`step`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, current?.slug, pool, direction],
  );

  const [status, setStatus] = useState<Status>("idle");
  const [chosen, setChosen] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null); // image_to_audio

  // Auto-lecture de l'audio cible en direction audio→image (une fois par item).
  const playedRef = useRef(-1);
  useEffect(() => {
    if (direction !== "audio_to_image" || !current) return;
    if (playedRef.current === step) return;
    playedRef.current = step;
    play(current.audio);
  }, [direction, current, step, play]);

  if (!current) return null;

  const locked = status !== "idle";

  function commit(slug: string) {
    if (locked || !current) return;
    const correct = slug === current.slug;
    setChosen(slug);
    setStatus(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      setChosen(null);
      setPending(null);
      setStatus("idle");
      advance(correct);
    }, ADVANCE_MS);
  }

  function optionRing(slug: string): string {
    if (status === "idle") return "ring-ink/10 hover:ring-ocre/60";
    if (chosen !== slug) return "ring-ink/10 opacity-60";
    return status === "correct" ? "ring-2 ring-teal" : "ring-2 ring-[#D64541]";
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-6">
      {/* Progression sobre (pas d'XP/score). */}
      <ProgressBar done={progress.done} total={progress.total} />

      <p className="mt-6 text-center text-sm font-medium text-ink/60">
        {CONSIGNE[direction]}
      </p>

      {direction === "audio_to_image" ? (
        <>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => play(current.audio)}
              aria-label="Réécouter"
              className="grid h-16 w-16 place-items-center rounded-full bg-teal text-creme hover:opacity-90"
            >
              <SpeakerIcon className="h-7 w-7" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {options.map((w) => (
              <button
                key={w.slug}
                type="button"
                disabled={locked}
                onClick={() => commit(w.slug)}
                className={`aspect-square overflow-hidden rounded-2xl bg-white p-2 ring-1 ${optionRing(
                  w.slug,
                )}`}
              >
                <WordImage word={w} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto mt-4 aspect-square w-40 overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-ink/10">
            <WordImage word={current} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {options.map((w) => {
              const isPending = pending === w.slug && status === "idle";
              return (
                <button
                  key={w.slug}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    play(w.audio);
                    setPending(w.slug);
                  }}
                  aria-label="Écouter ce son"
                  className={`grid aspect-square place-items-center rounded-2xl bg-white text-teal ring-1 ${
                    isPending ? "ring-2 ring-ocre" : optionRing(w.slug)
                  }`}
                >
                  <SpeakerIcon className="h-8 w-8" />
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={locked || !pending}
              onClick={() => pending && commit(pending)}
              className="rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90 disabled:opacity-40"
            >
              Valider
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full bg-ocre" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-ink/50">
        {done}/{total}
      </span>
    </div>
  );
}
