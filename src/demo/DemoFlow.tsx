// Fahemtu — Produit 0 : enchaînement de l'avant-goût gratuit.
// Intro → Discovery → AudioImageChoice (audio→image) → écran « pic ».
// Réutilise les mécaniques existantes telles quelles (via leurs props).
// Sobre, anti-décoratif, palette/typos de marque. Aucun appel /api, aucune auth.
import { useState, type ReactNode } from "react";
import { Discovery } from "../mechanics/Discovery";
import { AudioImageChoice } from "../mechanics/AudioImageChoice";
import { demoWords } from "./demoWords";

type Step = "intro" | "discovery" | "choice" | "pic";

export function DemoFlow() {
  const [step, setStep] = useState<Step>("intro");

  if (step === "intro") {
    return (
      <Centered>
        <div className="w-full max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ocre">
            Fahemtu
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
            Écoute, regarde, reconnais.
          </h1>
          <p className="mt-3 text-ink/70">
            Dix mots d'arabe, compris à l'oreille — sans rien lire.
          </p>
          <button
            type="button"
            onClick={() => setStep("discovery")}
            className="mt-8 rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
          >
            Commencer
          </button>
        </div>
      </Centered>
    );
  }

  if (step === "discovery") {
    return (
      <GameShell>
        <Discovery words={demoWords} onComplete={() => setStep("choice")} />
      </GameShell>
    );
  }

  if (step === "choice") {
    return (
      <GameShell>
        <AudioImageChoice
          direction="audio_to_image"
          consigne="Écoute, puis choisis l'image."
          words={demoWords}
          pool={demoWords}
          onComplete={() => setStep("pic")}
        />
      </GameShell>
    );
  }

  return <PicScreen />;
}

/** Écran de jeu : hauteur viewport stable → les mécaniques (SessionLayout +
 *  FitGrid en container-query) se dimensionnent correctement. */
function GameShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen-stable flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

/** Écran de contenu : centré, défilable si besoin. */
function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen-dynamic flex-col items-center justify-center px-6 py-10">
      {children}
    </div>
  );
}

function PicScreen() {
  return (
    <Centered>
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-ocre">
          Bien joué
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
          Tu viens de reconnaître 10 mots d'arabe, à l'oreille.
        </h1>
        <p className="mt-3 text-ink/70">
          C'est le début de l'arabe à l'oreille.
        </p>

        <a
          href="/mots"
          className="mt-8 inline-block rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
        >
          Aller plus loin
        </a>
      </div>
    </Centered>
  );
}
