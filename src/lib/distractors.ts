// Fahemtu — Produit 1 : logique de distracteurs commune (§4).
//
// Règles :
//   - distracteurs du MÊME cluster d'abord (un chat se distingue d'un chien,
//     pas d'une couleur) ;
//   - fallback sur les autres clusters DÉJÀ INTRODUITS si le cluster ne suffit pas ;
//   - JAMAIS un mot non encore introduit (le `pool` ne contient que des mots vus) ;
//   - ne JAMAIS échouer : si les candidats manquent, on renvoie moins d'options
//     plutôt que de planter.

import type { Word } from "../content/words";
import { shuffle } from "./shuffle";

/**
 * Choisit jusqu'à `count` distracteurs pour `target` parmi `pool`.
 * `pool` = mots déjà introduits, utilisables comme distracteurs.
 * Le résultat peut contenir MOINS de `count` éléments (jamais d'erreur).
 */
export function pickDistractors(
  target: Word,
  pool: readonly Word[],
  count: number,
): Word[] {
  if (count <= 0) return [];
  const candidates = pool.filter((w) => w.slug !== target.slug);
  const sameCluster = candidates.filter((w) => w.cluster === target.cluster);
  const otherClusters = candidates.filter((w) => w.cluster !== target.cluster);
  // Proches d'abord, puis complétion par les autres clusters déjà vus.
  const ordered = [...shuffle(sameCluster), ...shuffle(otherClusters)];
  return ordered.slice(0, count);
}

/**
 * Construit les options d'un item (cible incluse), mélangées.
 * `desiredOptions` = nombre total souhaité (cible + distracteurs).
 * Garantit au minimum la cible ; n'échoue jamais. La taille réelle vaut
 * `min(desiredOptions, 1 + distracteurs disponibles)`.
 */
export function buildOptions(
  target: Word,
  pool: readonly Word[],
  desiredOptions: number,
): Word[] {
  const distractors = pickDistractors(target, pool, Math.max(0, desiredOptions - 1));
  return shuffle([target, ...distractors]);
}
