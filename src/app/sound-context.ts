// Fahemtu — Produit 1 : contexte son (types + hook).
// Séparé du Provider pour le fast-refresh.

import { createContext, useContext } from "react";

export interface SoundValue {
  muted: boolean;
  toggleMuted: () => void;
  /** Joue un audio (interrompt la lecture en cours). No-op si coupé. */
  play: (src: string) => void;
  /** Rejoue le dernier audio demandé. */
  replay: () => void;
}

export const SoundContext = createContext<SoundValue | null>(null);

export function useSound(): SoundValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound doit être utilisé dans <SoundProvider>");
  return ctx;
}
