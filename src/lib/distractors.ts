// Fahemtu — Produit 1 : logique de distracteurs commune (§4).
//
// Règles :
//   - distracteurs du MÊME cluster d'abord (un chat se distingue d'un chien,
//     pas d'une couleur) ;
//   - fallback sur les autres clusters DÉJÀ INTRODUITS si le cluster ne suffit pas ;
//   - JAMAIS un mot non encore introduit (le `pool` ne contient que des mots vus) ;
//   - ne JAMAIS échouer : si les candidats manquent, on renvoie moins d'options
//     plutôt que de planter.

import { wordBySlug, type Word } from "../content/words";
import { confusablesOf } from "../content/confusables";
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

/** Signature commune des constructeurs d'options (cible incluse, mélangées). */
export type OptionBuilder = (
  target: Word,
  pool: readonly Word[],
  desiredOptions: number,
) => Word[];

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

/**
 * Options pour M2 (discrimination) : distracteurs phonétiquement proches
 * (confusables.ts) déjà introduits, complétés par la logique de cluster (§4)
 * si besoin. Ne plante jamais ; la cible est toujours présente.
 */
export function buildConfusableOptions(
  target: Word,
  pool: readonly Word[],
  desiredOptions: number,
): Word[] {
  const want = Math.max(0, desiredOptions - 1);
  const poolSlugs = new Set(pool.map((w) => w.slug));
  const confusables = confusablesOf(target.slug)
    .filter((s) => s !== target.slug && poolSlugs.has(s))
    .map((s) => wordBySlug[s])
    .filter(Boolean);

  let distractors = shuffle(confusables).slice(0, want);
  if (distractors.length < want) {
    // Complétion par cluster (§4) en excluant la cible et les déjà choisis.
    const taken = new Set([target.slug, ...distractors.map((w) => w.slug)]);
    const remaining = pool.filter((w) => !taken.has(w.slug));
    distractors = [
      ...distractors,
      ...pickDistractors(target, remaining, want - distractors.length),
    ];
  }
  return shuffle([target, ...distractors]);
}
