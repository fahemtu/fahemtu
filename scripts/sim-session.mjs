// Fahemtu — Produit 1 : simulation hors-UI de l'arc M1.
// « Joue » chaque session : reconstruit les blocs M1 (audio→image, image→audio),
// génère les options pour chaque cible et vérifie les invariants §4/§9 :
//   - la sélection de distracteurs n'échoue JAMAIS ;
//   - jamais de mot non encore introduit dans les options ;
//   - distracteurs du même cluster privilégiés ;
//   - la file converge (joueur correct → vide ; joueur fautif → termine quand même).
// Réplique la logique de src/lib/{distractors,shuffle,sessionArc}.ts et
// src/mechanics/useRetrievalQueue.ts. Si l'algo change, mettre à jour ici.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// --- Données (parse léger des fichiers générés) -----------------------------
const words = new Map(); // slug -> { slug, cluster, hasImage }
for (const line of read("src/content/words.ts").split("\n")) {
  const m = line.match(/\{\s*slug:\s*"([^"]+)".*?cluster:\s*"([^"]+)"/);
  if (m) words.set(m[1], { slug: m[1], cluster: m[2], hasImage: /\bimage:/.test(line) });
}

const sessions = [];
{
  const src = read("src/content/sessions.ts");
  for (const m of src.matchAll(/id:\s*(\d+)[\s\S]*?newWords:\s*\[([^\]]*)\]/g)) {
    const id = Number(m[1]);
    const slugs = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    sessions.push({ id, newWords: slugs });
  }
}
sessions.sort((a, b) => a.id - b.id);

// --- Algo répliqué ----------------------------------------------------------
const REQUEUE_GAP = 3;

function pickDistractors(target, pool, count) {
  if (count <= 0) return [];
  const cand = pool.filter((w) => w.slug !== target.slug);
  const same = cand.filter((w) => w.cluster === target.cluster);
  const other = cand.filter((w) => w.cluster !== target.cluster);
  return [...same, ...other].slice(0, count);
}
function buildOptions(target, pool, desired) {
  const d = pickDistractors(target, pool, Math.max(0, desired - 1));
  return [target, ...d];
}

function reviewWordsFor(id) {
  return sessions.filter((s) => s.id < id).flatMap((s) => s.newWords);
}

// --- Vérifs + simulation ----------------------------------------------------
let checks = 0;
let fail = 0;
const err = (msg) => {
  fail++;
  console.error(`✗ ${msg}`);
};

function verifyOptions(target, pool, desired, label) {
  let opts;
  try {
    opts = buildOptions(target, pool, desired);
  } catch (e) {
    return err(`${label}: buildOptions a levé une erreur (${e.message}).`);
  }
  checks++;
  if (!opts.some((o) => o.slug === target.slug)) err(`${label}: cible absente des options.`);
  if (opts.length < 1) err(`${label}: zéro option.`);
  if (opts.length > desired) err(`${label}: trop d'options (${opts.length} > ${desired}).`);
  const poolSlugs = new Set(pool.map((w) => w.slug));
  for (const o of opts) {
    if (o.slug !== target.slug && !poolSlugs.has(o.slug))
      err(`${label}: distracteur hors pool « ${o.slug} ».`);
  }
  // Distracteurs proches d'abord : si le cluster fournit assez, tous proches.
  const sameInPool = pool.filter((w) => w.cluster === target.cluster && w.slug !== target.slug);
  const distractors = opts.filter((o) => o.slug !== target.slug);
  if (sameInPool.length >= distractors.length) {
    const allSame = distractors.every((d) => d.cluster === target.cluster);
    if (!allSame) err(`${label}: distracteurs non proches alors que le cluster suffit.`);
  }
}

// Simule la file : joueur qui rate les `wrongFirst` premières fois chaque mot.
function simulateQueue(targets, wrongFirst, label) {
  let queue = [...targets].map((t) => t.slug);
  const wrongLeft = new Map(queue.map((s) => [s, wrongFirst]));
  const mastered = new Set();
  let steps = 0;
  const MAX = 10000;
  while (queue.length > 0) {
    if (++steps > MAX) return err(`${label}: file ne converge pas (>${MAX} étapes).`);
    const [head, ...rest] = queue;
    const left = wrongLeft.get(head) ?? 0;
    if (left > 0) {
      wrongLeft.set(head, left - 1);
      const pos = Math.min(rest.length, REQUEUE_GAP);
      queue = [...rest.slice(0, pos), head, ...rest.slice(pos)];
    } else {
      mastered.add(head);
      queue = rest;
    }
  }
  checks++;
  if (mastered.size !== new Set(targets.map((t) => t.slug)).size)
    err(`${label}: tous les mots ne sont pas maîtrisés à la fin.`);
}

for (const s of sessions) {
  if (s.newWords.length === 0) continue; // S8 preuve
  const newWords = s.newWords.map((sl) => words.get(sl));
  const pool = [...reviewWordsFor(s.id), ...s.newWords].map((sl) => words.get(sl));

  for (const t of newWords) {
    verifyOptions(t, pool, 4, `S${s.id} audio→image ${t.slug}`);
    verifyOptions(t, pool, 3, `S${s.id} image→audio ${t.slug}`);
  }
  // Joueur parfait, puis fautif (2 erreurs/mot) : doit terminer dans les deux cas.
  simulateQueue(newWords, 0, `S${s.id} file (parfait)`);
  simulateQueue(newWords, 2, `S${s.id} file (2 erreurs/mot)`);
}

console.log(`sim-session: ${checks} vérifications sur ${sessions.length} sessions.`);
if (fail) {
  console.error(`✗ sim-session: ${fail} échec(s).`);
  process.exit(1);
}
console.log("✓ sim-session: distracteurs OK, file convergente sur toutes les sessions.");
