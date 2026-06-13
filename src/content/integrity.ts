// Fahemtu — Produit 1 : check d'intégrité des DONNÉES (runtime, au démarrage).
// Vérifie les invariants vérifiables en mémoire (§9). La confrontation au
// système de fichiers (audio/image présents) est faite au build par
// scripts/check-assets.mjs — le navigateur ne peut pas lister public/.

import { WORDS, wordBySlug, type Cluster } from "./words";
import { SESSIONS } from "./sessions";
import { confusables } from "./confusables";

export interface IntegrityResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** Effectifs attendus par cluster (spec §2). */
const EXPECTED_CLUSTERS: Record<Cluster, number> = {
  gens: 7,
  animaux: 18,
  couleurs: 12,
  manger: 18,
  corps: 12,
};

export function checkContentIntegrity(): IntegrityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Slugs uniques.
  const seen = new Set<string>();
  for (const w of WORDS) {
    if (seen.has(w.slug)) errors.push(`Slug en double : "${w.slug}".`);
    seen.add(w.slug);
  }

  // Chaque Word : audio + (image | hex).
  for (const w of WORDS) {
    if (!w.audio) errors.push(`"${w.slug}" : audio manquant.`);
    if (!w.image && !w.hex) errors.push(`"${w.slug}" : ni image ni hex.`);
    if (w.image && w.hex)
      warnings.push(`"${w.slug}" : image ET hex définis (image utilisée).`);
  }

  // Effectifs par cluster.
  const counts = {} as Record<Cluster, number>;
  for (const w of WORDS) counts[w.cluster] = (counts[w.cluster] ?? 0) + 1;
  for (const [cluster, expected] of Object.entries(EXPECTED_CLUSTERS) as [
    Cluster,
    number,
  ][]) {
    const got = counts[cluster] ?? 0;
    if (got !== expected)
      warnings.push(`Cluster "${cluster}" : ${got} mots (attendu ${expected}).`);
  }

  // Sessions : slugs définis, pas de doublon inter-sessions, preuve cohérente.
  const introduced = new Set<string>();
  for (const s of SESSIONS) {
    for (const slug of s.newWords) {
      if (!wordBySlug[slug])
        errors.push(`Session ${s.id} référence un slug inconnu : "${slug}".`);
      if (introduced.has(slug))
        errors.push(`Slug "${slug}" introduit dans plusieurs sessions.`);
      introduced.add(slug);
    }
    if (s.isProof && s.newWords.length > 0)
      warnings.push(`Session ${s.id} (preuve) ne devrait pas introduire de mots.`);
  }

  // Tous les mots doivent être introduits quelque part avant la preuve.
  for (const w of WORDS) {
    if (!introduced.has(w.slug))
      warnings.push(`"${w.slug}" n'est introduit par aucune session.`);
  }

  // Confusables (M2) : tout slug référencé (clé ou voisin) doit exister.
  // Garde-fou contre typo / mot retiré — on n'avale pas l'erreur.
  for (const [slug, neighbours] of Object.entries(confusables)) {
    if (!wordBySlug[slug])
      errors.push(`Confusables : slug inconnu en clé : "${slug}".`);
    for (const n of neighbours) {
      if (!wordBySlug[n])
        errors.push(`Confusables : voisin inconnu "${n}" (pour "${slug}").`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
