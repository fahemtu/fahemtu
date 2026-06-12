// Fahemtu — Produit 1 : contexte de navigation (types + hook).
// Séparé du Provider pour le fast-refresh (un fichier .tsx = composants seuls).

import { createContext, useContext } from "react";

export type Route =
  | { name: "home" } // carte de parcours
  | { name: "onboarding" } // premier lancement (~2 min)
  | { name: "session"; sessionId: number } // lecteur de session (S1–S7) / preuve (S8)
  | { name: "summary"; sessionId: number }; // résumé inter-session

export interface NavigationValue {
  route: Route;
  navigate: (route: Route) => void;
  /** Retour à la carte de parcours. */
  goHome: () => void;
}

export const NavigationContext = createContext<NavigationValue | null>(null);

export function useNavigation(): NavigationValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation doit être utilisé dans <NavigationProvider>");
  }
  return ctx;
}
