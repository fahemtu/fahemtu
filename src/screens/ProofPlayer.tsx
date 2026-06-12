// Fahemtu — Produit 1 : moment de preuve (S8, §6).
// Rafale audio → image sur les 67 mots, ordre aléatoire, PASSAGE UNIQUE (chaque
// mot une fois), aucun nouvel enseignement. Feedback correctif bref (rouge/teal)
// mais PAS de réinsertion : ça défile. Fin → écran sobre « 67 ».

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "../app/navigation-context";
import { useProgress } from "../app/progress-context";
import { useSound } from "../app/sound-context";
import { WORDS, wordBySlug } from "../content/words";
import { WordImage } from "../ui/WordImage";
import { buildOptions } from "../lib/distractors";
import { shuffle } from "../lib/shuffle";
import { choiceRing, useChoiceFeedback } from "../mechanics/choiceFeedback";
import { ProgressBar } from "../mechanics/ProgressBar";

const PROOF_SESSION_ID = 8;
const TOTAL_WORDS = 67;

export function ProofPlayer() {
  const { goHome } = useNavigation();
  const { recordMastered, completeSession } = useProgress();
  const { play } = useSound();

  // Séquence figée : les 67 mots une fois, ordre aléatoire. Pool = tous les mots.
  const sequence = useMemo(() => shuffle(WORDS.map((w) => w.slug)), []);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const { status, chosen, locked, resolve } = useChoiceFeedback(() => {
    const next = index + 1;
    if (next >= sequence.length) setFinished(true);
    else setIndex(next);
  });

  const current = finished ? null : wordBySlug[sequence[index]] ?? null;

  const options = useMemo(
    () => (current ? buildOptions(current, WORDS, 4) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, finished],
  );

  // Lecture de l'audio à chaque item.
  useEffect(() => {
    if (current) play(current.audio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  // Marque S8 complétée à la fin (comme les autres sessions).
  const doneRef = useRef(false);
  useEffect(() => {
    if (finished && !doneRef.current) {
      doneRef.current = true;
      completeSession(PROOF_SESSION_ID);
    }
  }, [finished, completeSession]);

  if (finished) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-5 py-10 text-center sm:px-6 sm:py-12">
        <div className="text-6xl font-bold tabular-nums text-teal sm:text-7xl">
          {TOTAL_WORDS}
        </div>
        <p className="text-lg text-ink">
          Tu comprends 67 mots arabes à l'oreille.
        </p>
        <button
          type="button"
          onClick={goHome}
          className="mt-2 rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
        >
          Retour à la carte
        </button>
      </div>
    );
  }

  if (!current) return null;
  const currentSlug = current.slug;

  function answer(slug: string, correct: boolean) {
    if (correct) recordMastered(slug);
    resolve(slug, correct);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
      <ProgressBar done={index} total={sequence.length} />

      <p className="mt-6 text-center text-sm font-medium text-ink/60">
        Écoute et choisis l'image.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {options.map((w) => (
          <button
            key={w.slug}
            type="button"
            disabled={locked}
            onClick={() => answer(w.slug, w.slug === currentSlug)}
            className={`aspect-square touch-manipulation select-none overflow-hidden rounded-2xl bg-white p-2 ring-1 ${choiceRing(
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
