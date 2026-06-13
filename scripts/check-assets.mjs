// Fahemtu — Produit 1 : check d'intégrité des ASSETS (build-time).
// Vérifie, fichiers à l'appui, les critères d'acceptation §9 :
//   - chaque Word a un audio présent ET (une image présente OU un hex) ;
//   - chaque slug de session est défini dans words.ts ;
//   - pas de slug en double ;
//   - signale les fichiers orphelins (présents mais non déclarés).
// Le check d'intégrité "data" (runtime) vit dans src/content/integrity.ts ;
// celui-ci ajoute la confrontation au système de fichiers, impossible côté navigateur.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const RED = "\x1b[31m";
const YEL = "\x1b[33m";
const GRN = "\x1b[32m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";

const errors = [];
const warnings = [];

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

// --- Présence audio + (image | hex) ; fichiers sur disque -------------------
const audioFiles = new Set(
  readdirSync(join(root, "public/audio")).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4)),
);
const imageFiles = new Set(
  readdirSync(join(root, "public/images")).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)),
);

for (const w of words) {
  if (!w.hasAudio) errors.push(`"${w.slug}" : champ audio manquant.`);
  else if (!audioFiles.has(w.slug)) errors.push(`"${w.slug}" : fichier audio absent (public/audio/${w.slug}.mp3).`);

  if (!w.hasImage && !w.hasHex) {
    errors.push(`"${w.slug}" : ni image ni hex.`);
  } else if (w.hasImage && !imageFiles.has(w.slug)) {
    errors.push(`"${w.slug}" : image déclarée mais fichier absent (public/images/${w.slug}.png).`);
  }
}

// --- Orphelins (fichiers présents mais non déclarés) ------------------------
for (const f of audioFiles) if (!declared.has(f)) warnings.push(`Audio orphelin : public/audio/${f}.mp3 (slug non déclaré).`);
for (const f of imageFiles) if (!declared.has(f)) warnings.push(`Image orpheline : public/images/${f}.png (slug non déclaré).`);

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
console.log(`${DIM}check-assets:${RST} ${words.length} mots, ${audioFiles.size} audio, ${imageFiles.size} images.`);
for (const w of warnings) console.log(`${YEL}⚠ ${w}${RST}`);
if (errors.length) {
  for (const e of errors) console.log(`${RED}✗ ${e}${RST}`);
  console.error(`${RED}check-assets: ${errors.length} erreur(s) bloquante(s).${RST}`);
  process.exit(1);
}
console.log(`${GRN}✓ check-assets: intégrité OK (${warnings.length} avertissement(s)).${RST}`);
