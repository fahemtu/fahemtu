// Fahemtu — Produit 1 : structure des sessions (générée).
// Arc standard d'une session de contenu (S1–S7) :
//   découverte → récupération audio→image → discrimination
//   → révision spiralée (spiralMechanic, sur les mots des sessions précédentes)
//   → sprint
// S8 = moment de preuve : rafale audio→image sur les 67 mots.

export type Mechanic =
  | "decouverte"
  | "retrieval_audio_to_image"
  | "retrieval_image_to_audio"
  | "discrimination"
  | "tri"
  | "sprint"
  | "memory";

export interface Session {
  id: number;
  title: string;          // français — chrome
  newWords: string[];     // slugs introduits dans cette session
  spiralMechanic?: Mechanic; // mécanique de révision rotative (absente en S1 et S8)
  isProof?: boolean;      // S8
}

export const STANDARD_ARC: Mechanic[] = [
  "decouverte",
  "retrieval_audio_to_image",
  "discrimination",
  // <- spiralMechanic de la session, jouée sur les mots des sessions précédentes
  "sprint",
];

export const SESSIONS: Session[] = [
  { id: 1, title: "Les animaux (1)", newWords: ["chat", "chien", "cheval", "oiseau", "mouton", "vache", "lion", "chameau", "ane", "poule"] },
  { id: 2, title: "Les animaux (2) & couleurs", newWords: ["coq", "lapin", "souris", "elephant", "serpent", "tortue", "canard", "abeille", "rouge", "bleu"], spiralMechanic: "tri" },
  { id: 3, title: "Les couleurs", newWords: ["vert", "jaune", "noir", "blanc", "marron", "orange", "rose", "gris", "violet", "dore"], spiralMechanic: "retrieval_image_to_audio" },
  { id: 4, title: "Le corps (1)", newWords: ["main", "oeil", "bouche", "nez", "oreille", "pied", "coeur", "cheveux", "dent", "bras"], spiralMechanic: "memory" },
  { id: 5, title: "Le corps (2) & les gens", newWords: ["jambe", "doigt", "bebe", "garcon", "fille", "homme", "femme", "vieil-homme", "vieille-femme"], spiralMechanic: "tri" },
  { id: 6, title: "Manger & boire (1)", newWords: ["eau", "pain", "lait", "the", "cafe", "fruit", "pomme", "viande", "poisson"], spiralMechanic: "retrieval_image_to_audio" },
  { id: 7, title: "Manger & boire (2)", newWords: ["oeuf", "banane", "raisin", "datte", "riz", "fromage", "miel", "tomate", "olive"], spiralMechanic: "memory" },
  { id: 8, title: "Moment de preuve", newWords: [], isProof: true },
];

// Mots à réviser pour une session = tous les mots introduits avant elle.
export function reviewWordsFor(id: number): string[] {
  return SESSIONS.filter((s) => s.id < id).flatMap((s) => s.newWords);
}
