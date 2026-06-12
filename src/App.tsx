// Fahemtu — Produit 1 : point d'entrée.
// Routing : home (carte de parcours) / onboarding / session (lecteur, S8 preuve)
// / summary (résumé inter-session). Onboarding et moment de preuve : écrans
// encore placeholder (étapes 6–7). Progression persistée via ProgressProvider.

import { NavigationProvider } from "./app/navigation";
import { useNavigation } from "./app/navigation-context";
import { SoundProvider } from "./app/sound";
import { ProgressProvider } from "./app/progress";
import { AppShell } from "./app/AppShell";
import { IntegrityGate } from "./app/IntegrityGate";
import { JourneyMap } from "./screens/JourneyMap";
import { SessionPlayer } from "./screens/SessionPlayer";
import { Summary } from "./screens/Summary";

function Screens() {
  const { route, goHome } = useNavigation();

  switch (route.name) {
    case "home":
      return <JourneyMap />;
    case "onboarding":
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
          <span className="rounded-full bg-ocre/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocre">
            Onboarding
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Bienvenue</h1>
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
        </div>
      );
    case "session":
      return <SessionPlayer sessionId={route.sessionId} />;
    case "summary":
      return <Summary sessionId={route.sessionId} />;
  }
}

export default function App() {
  return (
    <NavigationProvider>
      <SoundProvider>
        <ProgressProvider>
          <IntegrityGate>
            <AppShell>
              <Screens />
            </AppShell>
          </IntegrityGate>
        </ProgressProvider>
      </SoundProvider>
    </NavigationProvider>
  );
}
