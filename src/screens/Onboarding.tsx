// Fahemtu — Produit 1 : onboarding (~2 min, premier lancement / rejouable).
// Pose la promesse + la signature pédagogique, puis fait FAIRE le geste cœur
// (audio → image) 1–2 fois, très facilement, avant S1.
// ORAL-ONLY dès le départ : aucun texte arabe ; le français reste du chrome.

import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "../app/navigation-context";
import { useProgress } from "../app/progress-context";
import { useSound } from "../app/sound-context";
import { SpeakerIcon } from "../app/icons";
import { WordImage } from "../ui/WordImage";
import { wordBySlug, type Word } from "../content/words";
import { shuffle } from "../lib/shuffle";
import { choiceRing, useChoiceFeedback } from "../mechanics/choiceFeedback";
import { FitGrid, SessionLayout } from "../mechanics/layout";

// Gestes guidés : cibles très distinctes (clusters différents) → faciles.
const GUIDED: { target: string; distractors: string[] }[] = [
  { target: "chat", distractors: ["rouge", "pomme"] },
  { target: "oiseau", distractors: ["main", "bleu"] },
];

export function Onboarding() {
  const { goHome } = useNavigation();
  const { markOnboarded } = useProgress();
  const [step, setStep] = useState(0); // 0 = promesse, 1..N = gestes, N+1 = fin

  const finish = () => {
    markOnboarded();
    goHome();
  };

  // 0 : promesse + signature
  if (step === 0) {
    return (
      <Centered>
        <p className="text-sm font-semibold uppercase tracking-widest text-ocre">
          Fahemtu
        </p>
        <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
          Écoute. Reconnais. Comprends.
        </h1>
        <p className="max-w-sm text-ink/70">
          Comprendre l'arabe que tu entends. Sans lecture, sans écriture, sans
          grammaire.
        </p>
        <PrimaryButton onClick={() => setStep(1)}>Commencer</PrimaryButton>
      </Centered>
    );
  }

  // 1..GUIDED.length : gestes guidés audio → image
  if (step <= GUIDED.length) {
    const item = GUIDED[step - 1];
    const target = wordBySlug[item.target];
    const options = item.distractors.map((s) => wordBySlug[s]).filter(Boolean);
    return (
      <GuidedItem
        key={step}
        index={step}
        total={GUIDED.length}
        target={target}
        distractors={options}
        onDone={() => setStep((s) => s + 1)}
      />
    );
  }

  // Fin : prêt → carte
  return (
    <Centered>
      <div className="text-5xl">✓</div>
      <h1 className="text-2xl font-bold text-ink">Tu as compris le geste.</h1>
      <p className="max-w-sm text-ink/70">
        À chaque mot : tu écoutes, tu reconnais l'image, tu comprends. C'est tout
        le produit.
      </p>
      <PrimaryButton onClick={finish}>Voir le parcours</PrimaryButton>
    </Centered>
  );
}

function GuidedItem({
  index,
  total,
  target,
  distractors,
  onDone,
}: {
  index: number;
  total: number;
  target: Word;
  distractors: Word[];
  onDone: () => void;
}) {
  const { play } = useSound();
  const options = useMemo(
    () => shuffle([target, ...distractors]),
    [target, distractors],
  );

  // Correct → on avance ; erreur → révélation puis nouvelle tentative (guidé).
  const { status, chosen, locked, resolve } = useChoiceFeedback((correct) => {
    if (correct) onDone();
  });

  // Auto-lecture à l'arrivée du geste.
  useEffect(() => {
    play(target.audio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.slug]);

  return (
    <SessionLayout>
      <p className="shrink-0 text-center text-xs font-semibold uppercase tracking-wide text-ink/40">
        Le geste {index}/{total}
      </p>
      <p className="mt-2 shrink-0 text-center text-sm font-medium text-ink/60">
        Touche l'image du mot que tu entends.
      </p>

      <div className="mt-4 flex shrink-0 justify-center">
        <button
          type="button"
          onClick={() => play(target.audio)}
          aria-label="Réécouter"
          className="grid h-16 w-16 place-items-center rounded-full bg-teal text-creme hover:opacity-90"
        >
          <SpeakerIcon className="h-7 w-7" />
        </button>
      </div>

      <FitGrid count={options.length} cols={3}>
        {options.map((w, i) => (
          <button
            key={w.slug}
            type="button"
            disabled={locked}
            aria-label={`Choix ${i + 1}`}
            onClick={() => resolve(w.slug, w.slug === target.slug)}
            className={`min-h-0 touch-manipulation select-none overflow-hidden rounded-2xl bg-white p-2 ring-1 ${choiceRing(
              w.slug,
              target.slug,
              status,
              chosen,
            )}`}
          >
            <WordImage word={w} />
          </button>
        ))}
      </FitGrid>
    </SessionLayout>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center gap-6 px-5 py-10 text-center sm:px-6 sm:py-12">
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
    >
      {children}
    </button>
  );
}
