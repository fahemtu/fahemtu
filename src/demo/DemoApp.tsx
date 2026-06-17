// Fahemtu — Produit 0 : racine de l'avant-goût gratuit.
// Seul provider nécessaire : SoundProvider (les mécaniques utilisent useSound).
// Pas de ProgressProvider / NavigationProvider / AuthGate.
import { SoundProvider } from "../app/sound";
import { DemoFlow } from "./DemoFlow";

export function DemoApp() {
  return (
    <SoundProvider>
      <DemoFlow />
    </SoundProvider>
  );
}
