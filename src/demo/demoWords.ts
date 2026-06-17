// Fahemtu — Produit 0 : sous-ensemble gratuit (10 animaux).
// Sélection en LECTURE SEULE depuis le contenu existant — ne modifie pas words.ts.
import { wordBySlug, type Word } from "../content/words";

const DEMO_SLUGS = [
  "chat",
  "chien",
  "cheval",
  "oiseau",
  "lion",
  "lapin",
  "poule",
  "canard",
  "vache",
  "souris",
] as const;

export const demoWords: Word[] = DEMO_SLUGS.map((s) => wordBySlug[s]).filter(
  Boolean,
);
