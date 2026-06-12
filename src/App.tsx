// Fahemtu — Produit 1 : point d'entrée.
// Routing : home (carte) / onboarding / session (lecteur, S8 preuve) / summary.
// Au premier lancement (onboarding non vu), on démarre sur l'onboarding.
// Progression persistée via ProgressProvider.

import { NavigationProvider } from "./app/navigation";
import { useNavigation } from "./app/navigation-context";
import { SoundProvider } from "./app/sound";
import { ProgressProvider } from "./app/progress";
import { useProgress } from "./app/progress-context";
import { AppShell } from "./app/AppShell";
import { IntegrityGate } from "./app/IntegrityGate";
import { JourneyMap } from "./screens/JourneyMap";
import { SessionPlayer } from "./screens/SessionPlayer";
import { Summary } from "./screens/Summary";
import { Onboarding } from "./screens/Onboarding";

function Screens() {
  const { route } = useNavigation();

  switch (route.name) {
    case "home":
      return <JourneyMap />;
    case "onboarding":
      return <Onboarding />;
    case "session":
      return <SessionPlayer sessionId={route.sessionId} />;
    case "summary":
      return <Summary sessionId={route.sessionId} />;
  }
}

function Bootstrap() {
  const { onboarded } = useProgress();
  // Route initiale décidée une fois, à partir de l'état persisté.
  const initialRoute = onboarded
    ? ({ name: "home" } as const)
    : ({ name: "onboarding" } as const);

  return (
    <NavigationProvider initialRoute={initialRoute}>
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

export default function App() {
  return (
    <ProgressProvider>
      <Bootstrap />
    </ProgressProvider>
  );
}
