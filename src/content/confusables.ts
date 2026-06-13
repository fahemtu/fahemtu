// confusables.ts
// Mots proches À L'OREILLE EN ARABE. Sert UNIQUEMENT aux distracteurs de M2.
// Jamais affiché : aucun texte arabe/translittéré n'est visible par l'apprenant.
// Slugs = slugs français (noms de fichiers audio/image). À affiner si besoin lors de la relecture native.

const CONFUSABLE_PAIRS: [string, string][] = [
  ['coeur', 'chien'],               // qalb / kalb
  ['lion', 'noir'],                 // asad / aswad
  ['oeuf', 'blanc'],                // bayḍa / abyaḍ
  ['vieil-homme', 'vieille-femme'], // musinn / musinna (finale féminine -a)
  ['cheval', 'ane'],                // ḥiṣān / ḥimār
  ['dent', 'vieil-homme'],          // sinn / mu-sinn
  ['datte', 'tomate'],              // tamr / ṭamāṭim
  ['the', 'cheveux'],               // shāy / shaʿr
  ['lait', 'viande'],               // laban / laḥm
  ['oeil', 'raisin'],               // ʿayn / ʿinab
  ['souris', 'bouche'],             // faʾr / fam
  ['vache', 'canard'],              // baqara / baṭṭa
];

const CONFUSABLE_GROUPS: string[][] = [
  // adjectifs de couleur en aF3aL — même squelette « a_a_ »
  ['rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc'],
  // aḥmar / azraq / akhḍar / aṣfar / aswad / abyaḍ
];

export const confusables: Record<string, string[]> = (() => {
  const map: Record<string, Set<string>> = {};
  const link = (a: string, b: string) => {
    if (a === b) return;
    (map[a] ??= new Set()).add(b);
    (map[b] ??= new Set()).add(a);
  };
  for (const [a, b] of CONFUSABLE_PAIRS) link(a, b);
  for (const group of CONFUSABLE_GROUPS) {
    for (const a of group) for (const b of group) link(a, b);
  }
  return Object.fromEntries(
    Object.entries(map).map(([slug, set]) => [slug, [...set]]),
  );
})();

/**
 * Voisins phonétiques d'un slug (contrat attendu par M2 / buildConfusableOptions).
 * Dérivé de `confusables` pour ne pas changer la logique de distracteurs (§4).
 */
export function confusablesOf(slug: string): string[] {
  return confusables[slug] ?? [];
}
