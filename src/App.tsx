// Fahemtu — Produit 1 : point d'entrée.
// Étape 1 : coquille (tokens + AppShell + routing) avec écrans placeholder.
// Les écrans réels (carte de parcours, onboarding, lecteur, preuve, résumé)
// arrivent aux étapes suivantes.

import { useEffect } from "react";
import { NavigationProvider } from "./app/navigation";
import { useNavigation } from "./app/navigation-context";
import { SoundProvider } from "./app/sound";
import { useSound } from "./app/sound-context";
import { AppShell } from "./app/AppShell";
import { IntegrityGate } from "./app/IntegrityGate";
import { SESSIONS } from "./content/sessions";
import { wordBySlug } from "./content/words";
import { WordImage } from "./ui/WordImage";
import { preloadWords } from "./lib/assets";

function Placeholder({
  badge,
  title,
  children,
}: {
  badge: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <span className="rounded-full bg-ocre/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocre">
        {badge}
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
      {children}
    </div>
  );
}

function HomePlaceholder() {
  const { navigate } = useNavigation();
  return (
    <Placeholder badge="Carte de parcours" title="Les mots qui débloquent l'arabe">
      <p className="max-w-md text-ink/70">
        Écran d'accueil provisoire (étape 1). La carte des 8 sessions et le
        compteur « mots compris » arrivent à l'étape 5.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ name: "onboarding" })}
          className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
        >
          Onboarding
        </button>
        {SESSIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => navigate({ name: "session", sessionId: s.id })}
            className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
          >
            S{s.id}
          </button>
        ))}
      </div>
    </Placeholder>
  );
}

// Sonde provisoire (étape 2) : vérifie le chargement audio/image et le rendu
// image|hex. Aucun texte arabe ni traduction FR — clic = jouer l'audio.
// Remplacée par les mécaniques réelles à l'étape 3.
function ContentProbe({ slugs }: { slugs: string[] }) {
  const { play } = useSound();
  const words = slugs.map((s) => wordBySlug[s]).filter(Boolean);

  useEffect(() => {
    preloadWords(words);
  }, [words]);

  return (
    <div className="grid grid-cols-5 gap-3">
      {words.map((w) => (
        <button
          key={w.slug}
          type="button"
          onClick={() => play(w.audio)}
          aria-label="Écouter"
          className="aspect-square overflow-hidden rounded-xl bg-creme p-1 ring-1 ring-ink/10 hover:ring-ocre/60"
        >
          <WordImage word={w} />
        </button>
      ))}
    </div>
  );
}

function Screens() {
  const { route, navigate, goHome } = useNavigation();

  switch (route.name) {
    case "home":
      return <HomePlaceholder />;
    case "onboarding":
      return (
        <Placeholder badge="Onboarding" title="Bienvenue">
          <p className="max-w-md text-ink/70">
            Onboarding provisoire (étape 7). Il posera la promesse et le geste
            audio ↔ image.
          </p>
          <button
            type="button"
            onClick={goHome}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-creme hover:opacity-90"
          >
            Aller à la carte
          </button>
        </Placeholder>
      );
    case "session": {
      const session = SESSIONS.find((s) => s.id === route.sessionId);
      return (
        <Placeholder
          badge={`Session ${route.sessionId}`}
          title={session?.title ?? "Session"}
        >
          <p className="max-w-md text-ink/70">
            Lecteur de session provisoire (étape 3). Utilise le bouton accueil
            (en haut) pour tester la confirmation de sortie.
          </p>
          {session && <ContentProbe slugs={session.newWords} />}
          <button
            type="button"
            onClick={() =>
              navigate({ name: "summary", sessionId: route.sessionId })
            }
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-creme hover:opacity-90"
          >
            Terminer (vers résumé)
          </button>
        </Placeholder>
      );
    }
    case "summary":
      return (
        <Placeholder badge="Résumé" title="Bien joué">
          <p className="max-w-md text-ink/70">
            Résumé inter-session provisoire (étape 5).
          </p>
          <button
            type="button"
            onClick={goHome}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-creme hover:opacity-90"
          >
            Retour à la carte
          </button>
        </Placeholder>
      );
  }
}

export default function App() {
  return (
    <NavigationProvider>
      <SoundProvider>
        <IntegrityGate>
          <AppShell>
            <Screens />
          </AppShell>
        </IntegrityGate>
      </SoundProvider>
    </NavigationProvider>
  );
}
