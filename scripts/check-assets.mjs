// Fahemtu — Produit 1 : check d'intégrité des DÉCLARATIONS de contenu (build-time).
//
// Palier 4 : les binaires payants (PNG/MP3) ne vivent plus dans public/ — ils
// sont servis via URLs signées depuis le bucket privé. Ce script ne vérifie
// donc PLUS la présence physique des fichiers ; il valide uniquement la
// cohérence des déclarations (impossible à faire côté navigateur) :
//   - chaque Word déclare un `audio` et (une `image` OU un `hex`) ;
//   - pas de slug en double ;
//   - chaque slug de session est défini dans words.ts ;
//   - chaque slug de confusables est défini dans words.ts.
// Le check d'intégrité "data" runtime vit, lui, dans src/content/integrity.ts.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";

const errors = [];

// --- Parse words.ts (objets sur une ligne, format généré) -------------------
const wordsSrc = read("src/content/words.ts");
const words = [];
for (const line of wordsSrc.split("\n")) {
  const m = line.match(/\{\s*slug:\s*"([^"]+)"/);
  if (!m) continue;
  const slug = m[1];
  words.push({
    slug,
    hasImage: /\bimage:\s*"/.test(line),
    hasHex: /\bhex:\s*"/.test(line),
    hasAudio: /\baudio:\s*"/.test(line),
  });
}

if (words.length === 0) errors.push("Aucun Word parsé depuis words.ts (format inattendu ?).");

// --- Doublons de slug --------------------------------------------------------
const seen = new Set();
for (const w of words) {
  if (seen.has(w.slug)) errors.push(`Slug en double : "${w.slug}".`);
  seen.add(w.slug);
}
const declared = seen;

// --- Déclarations : audio + (image | hex) -----------------------------------
// (Présence des champs dans words.ts — pas de fichier sur disque à vérifier.)
for (const w of words) {
  if (!w.hasAudio) errors.push(`"${w.slug}" : champ audio manquant.`);
  if (!w.hasImage && !w.hasHex) errors.push(`"${w.slug}" : ni image ni hex.`);
}

// --- Slugs de sessions définis dans words.ts --------------------------------
const sessionsSrc = read("src/content/sessions.ts");
for (const m of sessionsSrc.matchAll(/newWords:\s*\[([^\]]*)\]/g)) {
  for (const sm of m[1].matchAll(/"([^"]+)"/g)) {
    if (!declared.has(sm[1])) errors.push(`Session référence un slug inconnu : "${sm[1]}".`);
  }
}

// --- Slugs de confusables (M2) définis dans words.ts ------------------------
// Tout slug cité (paires ou groupes) doit exister — typo / mot retiré = échec.
const confusablesSrc = read("src/content/confusables.ts");
for (const m of confusablesSrc.matchAll(/['"]([a-z][a-z-]*)['"]/g)) {
  if (!declared.has(m[1]))
    errors.push(`Confusables référence un slug inconnu : "${m[1]}".`);
}

// --- Rapport -----------------------------------------------------------------
console.log(`${DIM}check-assets:${RST} ${words.length} mots déclarés.`);
if (errors.length) {
  for (const e of errors) console.log(`${RED}✗ ${e}${RST}`);
  console.error(`${RED}check-assets: ${errors.length} erreur(s) bloquante(s).${RST}`);
  process.exit(1);
}
console.log(`${GRN}✓ check-assets: déclarations cohérentes.${RST}`);
