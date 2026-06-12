// Fahemtu — Produit 1 : groupes de mots phonétiquement proches (mécanique M2).
//
// Asset à CURER (cf. spec §10) : graine `qalb`/`kalb`, structure extensible.
// Chaque groupe liste des slugs dont les mots arabes partagent un phonème dur
// (ع ح خ ق ص ط ض) ou un squelette proche — pour forcer l'écoute de la consonne.
// L'arabe en commentaire est une RÉFÉRENCE de build, jamais rendu à l'apprenant.
//
// Garantie d'usage : M2 privilégie ces voisins comme distracteurs quand ils sont
// déjà introduits, et complète/retombe sur la logique de cluster (§4) sinon —
// la sélection ne plante jamais (voir buildConfusableOptions).

export const CONFUSABLE_GROUPS: string[][] = [
  ["coeur", "chien"], // قَلْب qalb / كَلْب kalb — graine (ق vs ك, paire minimale)
  ["cheval", "ane"], // حِصَان ḥiṣān / حِمَار ḥimār — ح initial, squelette proche
  ["cafe", "pied"], // قَهْوَة qahwa / قَدَم qadam — ق initial
  ["chat", "coeur"], // قِطّ qiṭṭ / قَلْب qalb — ق emphatique
  ["mouton", "pain"], // خَرُوف kharūf / خُبْز khubz — خ initial
  ["raisin", "miel"], // عِنَب ʿinab / عَسَل ʿasal — ع initial
];

/** Voisins phonétiques d'un slug (union de tous les groupes le contenant). */
export function confusablesOf(slug: string): string[] {
  const out = new Set<string>();
  for (const group of CONFUSABLE_GROUPS) {
    if (!group.includes(slug)) continue;
    for (const s of group) if (s !== slug) out.add(s);
  }
  return [...out];
}
