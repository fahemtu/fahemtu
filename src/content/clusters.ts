// Fahemtu — Produit 1 : libellés FR des clusters (chrome admis pour M3).
// Le libellé de catégorie est du chrome ; il ne traduit pas le mot cible.

import type { Cluster } from "./words";

export const CLUSTER_LABEL: Record<Cluster, string> = {
  gens: "Les gens",
  animaux: "Animaux",
  couleurs: "Couleurs",
  manger: "Manger & boire",
  corps: "Le corps",
};

export const CLUSTER_ORDER: Cluster[] = [
  "animaux",
  "couleurs",
  "corps",
  "gens",
  "manger",
];
