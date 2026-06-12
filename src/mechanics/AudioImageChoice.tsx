// Fahemtu — Produit 1 : choix audio ↔ image (cœur). Sert M1 et M2.
//
// ORAL-ONLY : aucun texte arabe, aucune traduction FR. Le sens passe par
// l'audio (arabe) et l'image. Seul texte = chrome (consigne générique).
//
//   audio_to_image : on joue l'audio ; choisir l'image (4 options).
//   image_to_audio : on montre l'image ; choisir le bon son (3 boutons son).
//
// `optionBuilder` choisit la stratégie de distracteurs :
//   - cluster (§4) pour M1 ;
//   - confusables (phonétiquement proches) pour M2 (discrimination).
//
// Feedback correctif partagé (rouge fautif + teal bonne réponse). Erreur → le
// mot revient plus loin dans la file (récupération active plus tard).

import { useEffect, useMemo, useRef, useState } from "react";
import { useSound } from "../app/sound-context";
import { SpeakerIcon } from "../app/icons";
import { WordImage } from "../ui/WordImage";
import { buildOptions, type OptionBuilder } from "../lib/distractors";
import { type MechanicProps } from "./types";
import { useRetrievalQueue } from "./useRetrievalQueue";
import { choiceRing, useChoiceFeedback } from "./choiceFeedback";
import { ProgressBar } from "./ProgressBar";
import { FitGrid, SessionLayout } from "./layout";

export type Direction = "audio_to_image" | "image_to_audio";

const OPTION_COUNT: Record<Direction, number> = {
  audio_to_image: 4,
  image_to_audio: 3,
};

export function AudioImageChoice({
  words,
  pool,
  onComplete,
  onWordMastered,
  direction,
  optionBuilder = buildOptions,
  consigne,
}: MechanicProps & {
  direction: Direction;
  optionBuilder?: OptionBuilder;
  consigne: string;
}) {
  const { play } = useSound();
  const { current, step, progress, advance } = useRetrievalQueue(words, onComplete);
  const { status, chosen, locked, resolve } = useChoiceFeedback(advance);

  // Récupération correcte → mot compris (§8).
  const answer = (id: string, correct: boolean) => {
    if (correct && current) onWordMastered?.(current.slug);
    resolve(id, correct);
  };

  const options = useMemo(
    () => (current ? optionBuilder(current, pool, OPTION_COUNT[direction]) : []),
    // Régénéré à chaque item (`step`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, current?.slug, pool, direction, optionBuilder],
  );

  // Sélection en attente (image_to_audio), indexée par item pour s'invalider
  // automatiquement au changement d'item (pas d'effet de reset).
  const [pending, setPending] = useState<{ step: number; slug: string } | null>(
    null,
  );
  const pendingSlug = pending?.step === step ? pending.slug : null;

  // Auto-lecture de l'audio cible en direction audio→image (une fois par item).
  const playedRef = useRef(-1);
  useEffect(() => {
    if (direction !== "audio_to_image" || !current) return;
    if (playedRef.current === step) return;
    playedRef.current = step;
    play(current.audio);
  }, [direction, current, step, play]);

  if (!current) return null;
  const currentSlug = current.slug;

  return (
    <SessionLayout>
      <div className="shrink-0">
        <ProgressBar done={progress.done} total={progress.total} />
      </div>

      <p className="mt-4 shrink-0 text-center text-sm font-medium text-ink/60">
        {consigne}
      </p>

      {direction === "audio_to_image" ? (
        <>
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

          <FitGrid count={options.length} cols={2} cap={260}>
            {options.map((w, i) => (
              <button
                key={w.slug}
                type="button"
                disabled={locked}
                aria-label={`Choix ${i + 1}`}
                onClick={() => answer(w.slug, w.slug === currentSlug)}
                className={`aspect-square min-h-0 touch-manipulation select-none overflow-hidden rounded-2xl bg-white p-2 ring-1 ${choiceRing(
                  w.slug,
                  currentSlug,
                  status,
                  chosen,
                )}`}
              >
                <WordImage word={w} />
              </button>
            ))}
          </FitGrid>
        </>
      ) : (
        <>
          <div className="mt-3 flex min-h-0 flex-1 items-center justify-center">
            <div className="aspect-square h-full max-h-full max-w-full overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-ink/10">
              <WordImage word={current} />
            </div>
          </div>

          <div className="mt-3 grid shrink-0 grid-cols-3 gap-3 sm:gap-4">
            {options.map((w, i) => {
              const isPending = pendingSlug === w.slug && status === "idle";
              return (
                <button
                  key={w.slug}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    play(w.audio);
                    setPending({ step, slug: w.slug });
                  }}
                  aria-label={`Écouter le son ${i + 1}`}
                  aria-pressed={isPending}
                  className={`grid h-16 touch-manipulation select-none place-items-center rounded-2xl bg-white text-teal ring-1 sm:h-20 ${
                    isPending
                      ? "ring-2 ring-ocre"
                      : choiceRing(w.slug, currentSlug, status, chosen)
                  }`}
                >
                  <SpeakerIcon className="h-8 w-8" />
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex shrink-0 justify-center">
            <button
              type="button"
              disabled={locked || !pendingSlug}
              onClick={() =>
                pendingSlug && answer(pendingSlug, pendingSlug === currentSlug)
              }
              className="rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90 disabled:opacity-40"
            >
              Valider
            </button>
          </div>
        </>
      )}
    </SessionLayout>
  );
}
