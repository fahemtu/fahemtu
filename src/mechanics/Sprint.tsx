// Fahemtu — Produit 1 : M4, sprint audio (tempo).
// Enchaînement rapide audio → image, rythme soutenu : minuteur par item, le
// temps écoulé compte comme une erreur (révélation corrective, sans relance).
// Séquence de longueur fixe (cycle des mots), pas une file jusqu'à maîtrise.
// Sert aussi de format au moment de preuve (§6, étape 6).

import { useEffect, useMemo, useRef, useState } from "react";
import { useSound } from "../app/sound-context";
import { WordImage } from "../ui/WordImage";
import { buildOptions } from "../lib/distractors";
import { shuffle } from "../lib/shuffle";
import { wordBySlug, type Word } from "../content/words";
import { type MechanicProps } from "./types";
import { choiceRing, useChoiceFeedback } from "./choiceFeedback";
import { ProgressBar } from "./ProgressBar";

/** Délai par item (tempo). Au-delà → compté comme manqué. */
const ITEM_MS = 3500;

function buildSequence(words: Word[], count: number): string[] {
  const out: string[] = [];
  while (out.length < count) {
    for (const w of shuffle(words)) {
      if (out.length >= count) break;
      out.push(w.slug);
    }
  }
  return out;
}

export function Sprint({
  words,
  pool,
  onComplete,
  onWordMastered,
  count,
}: MechanicProps & { count: number }) {
  const { play } = useSound();
  const sequence = useMemo(
    () => buildSequence(words, count),
    // Séquence figée à l'entrée du bloc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [index, setIndex] = useState(0);
  const doneRef = useRef(false);

  const { status, chosen, locked, resolve } = useChoiceFeedback(() => {
    const next = index + 1;
    if (next >= sequence.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    } else {
      setIndex(next);
    }
  });

  const current = wordBySlug[sequence[index]] ?? null;

  const options = useMemo(
    () => (current ? buildOptions(current, pool, 4) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, pool],
  );

  // Lecture de l'audio à chaque item.
  useEffect(() => {
    if (current) play(current.audio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Minuteur par item : temps écoulé = manqué (révélation, pas de relance).
  useEffect(() => {
    if (locked || !current) return;
    const t = window.setTimeout(() => resolve(null, false), ITEM_MS);
    return () => window.clearTimeout(t);
  }, [index, locked, current, resolve]);

  if (!current) return null;
  const currentSlug = current.slug;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-6">
      <ProgressBar done={index} total={sequence.length} />

      <p className="mt-6 text-center text-sm font-medium text-ink/60">
        Sprint — écoute et choisis vite.
      </p>

      {/* Compte à rebours (informatif). Redémarre à chaque item via `key`. */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-ink/10">
        {status === "idle" && (
          <div
            key={index}
            className="h-full bg-teal"
            style={{ animation: `fahemtu-countdown ${ITEM_MS}ms linear forwards` }}
          />
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {options.map((w) => (
          <button
            key={w.slug}
            type="button"
            disabled={locked}
            onClick={() => {
              const correct = w.slug === currentSlug;
              if (correct) onWordMastered?.(currentSlug);
              resolve(w.slug, correct);
            }}
            className={`aspect-square overflow-hidden rounded-2xl bg-white p-2 ring-1 ${choiceRing(
              w.slug,
              currentSlug,
              status,
              chosen,
            )}`}
          >
            <WordImage word={w} />
          </button>
        ))}
      </div>
    </div>
  );
}
