// Fahemtu — Produit 1 : simulation hors-UI de l'arc complet (étape 4).
// « Joue » chaque session et vérifie les invariants §4/§5/§9 :
//   - distracteurs (cluster ET confusables) ne plantent JAMAIS ;
//   - jamais de mot non encore introduit dans les options ;
//   - distracteurs du même cluster privilégiés (M1) ;
//   - tri (M3) : au moins une catégorie, dont la bonne ;
//   - la file converge (joueur correct ET joueur fautif) ;
//   - 50–80 interactions par session de contenu (jeu parfait).
// Réplique la logique de src/lib/{distractors,shuffle,sessionArc} et
// src/content/confusables. Si l'algo change, mettre à jour ici.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// --- Données ---------------------------------------------------------------
const words = new Map();
for (const line of read("src/content/words.ts").split("\n")) {
  const m = line.match(/\{\s*slug:\s*"([^"]+)".*?cluster:\s*"([^"]+)"/);
  if (m) words.set(m[1], { slug: m[1], cluster: m[2] });
}

const sessions = [];
for (const m of read("src/content/sessions.ts").matchAll(
  /\{\s*id:\s*(\d+)[\s\S]*?newWords:\s*\[([^\]]*)\](?:[^}]*?spiralMechanic:\s*"([^"]+)")?[^}]*\}/g,
)) {
  sessions.push({
    id: Number(m[1]),
    newWords: [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
    spiral: m[3] ?? null,
  });
}
sessions.sort((a, b) => a.id - b.id);

// confusables : reconstruit la map (paires + groupes) comme le fichier source.
const confMap = {};
{
  const src = read("src/content/confusables.ts");
  const slugs = (s) => [...s.matchAll(/['"]([a-z][a-z-]*)['"]/g)].map((m) => m[1]);
  const link = (a, b) => {
    if (a === b) return;
    (confMap[a] ??= new Set()).add(b);
    (confMap[b] ??= new Set()).add(a);
  };
  const pairsBlock = src.match(/CONFUSABLE_PAIRS[\s\S]*?\[([\s\S]*?)\];/);
  if (pairsBlock) {
    for (const row of pairsBlock[1].matchAll(/\[([^\]]*)\]/g)) {
      const [a, b] = slugs(row[1]);
      if (a && b) link(a, b);
    }
  }
  const groupsBlock = src.match(/CONFUSABLE_GROUPS[\s\S]*?\[([\s\S]*?)\];/);
  if (groupsBlock) {
    for (const row of groupsBlock[1].matchAll(/\[([^\]]*)\]/g)) {
      const g = slugs(row[1]);
      for (const a of g) for (const b of g) link(a, b);
    }
  }
}
const confusablesOf = (slug) => [...(confMap[slug] ?? [])];

// --- Algo répliqué ----------------------------------------------------------
const REQUEUE_GAP = 3;
const M2_ITEMS = 10;
const SPIRAL_ITEMS = 12;
const MEMORY_PAIRS = 6;
const SPRINT_MIN = 20;

function pickDistractors(target, pool, count) {
  if (count <= 0) return [];
  const cand = pool.filter((w) => w.slug !== target.slug);
  const same = cand.filter((w) => w.cluster === target.cluster);
  const other = cand.filter((w) => w.cluster !== target.cluster);
  return [...same, ...other].slice(0, count);
}
function buildOptions(target, pool, desired) {
  return [target, ...pickDistractors(target, pool, Math.max(0, desired - 1))];
}
function buildConfusableOptions(target, pool, desired) {
  const want = Math.max(0, desired - 1);
  const poolSlugs = new Set(pool.map((w) => w.slug));
  let d = confusablesOf(target.slug)
    .filter((s) => s !== target.slug && poolSlugs.has(s))
    .map((s) => words.get(s))
    .filter(Boolean)
    .slice(0, want);
  if (d.length < want) {
    const taken = new Set([target.slug, ...d.map((w) => w.slug)]);
    d = [...d, ...pickDistractors(target, pool.filter((w) => !taken.has(w.slug)), want - d.length)];
  }
  return [target, ...d];
}

const reviewWordsFor = (id) => sessions.filter((s) => s.id < id).flatMap((s) => s.newWords);

// --- Vérifs -----------------------------------------------------------------
let checks = 0;
let fail = 0;
const err = (m) => {
  fail++;
  console.error(`✗ ${m}`);
};

function verifyOptions(builder, target, pool, desired, label, requireClose) {
  let opts;
  try {
    opts = builder(target, pool, desired);
  } catch (e) {
    return err(`${label}: builder a levé une erreur (${e.message}).`);
  }
  checks++;
  if (!opts.some((o) => o.slug === target.slug)) err(`${label}: cible absente.`);
  if (opts.length < 1 || opts.length > desired) err(`${label}: ${opts.length} options (1..${desired}).`);
  const poolSlugs = new Set(pool.map((w) => w.slug));
  for (const o of opts)
    if (o.slug !== target.slug && !poolSlugs.has(o.slug)) err(`${label}: distracteur hors pool « ${o.slug} ».`);
  if (requireClose) {
    const sameInPool = pool.filter((w) => w.cluster === target.cluster && w.slug !== target.slug);
    const dist = opts.filter((o) => o.slug !== target.slug);
    if (sameInPool.length >= dist.length && !dist.every((d) => d.cluster === target.cluster))
      err(`${label}: distracteurs non proches alors que le cluster suffit.`);
  }
}

function simulateQueue(targets, wrongFirst, label) {
  let queue = targets.map((t) => t.slug);
  const wrongLeft = new Map(queue.map((s) => [s, wrongFirst]));
  const mastered = new Set();
  let steps = 0;
  while (queue.length > 0) {
    if (++steps > 10000) return err(`${label}: file ne converge pas.`);
    const [head, ...rest] = queue;
    if ((wrongLeft.get(head) ?? 0) > 0) {
      wrongLeft.set(head, wrongLeft.get(head) - 1);
      const pos = Math.min(rest.length, REQUEUE_GAP);
      queue = [...rest.slice(0, pos), head, ...rest.slice(pos)];
    } else {
      mastered.add(head);
      queue = rest;
    }
  }
  checks++;
  if (mastered.size !== new Set(targets.map((t) => t.slug)).size) err(`${label}: maîtrise incomplète.`);
}

const uniq = (arr) => [...new Map(arr.map((w) => [w.slug, w])).values()];

for (const s of sessions) {
  if (s.newWords.length === 0) continue; // S8 preuve

  const newWords = s.newWords.map((sl) => words.get(sl));
  const review = reviewWordsFor(s.id).map((sl) => words.get(sl));
  const prev = sessions.find((x) => x.id === s.id - 1);
  const recent = (prev?.newWords ?? []).map((sl) => words.get(sl));
  const pool = [...reviewWordsFor(s.id), ...s.newWords].map((sl) => words.get(sl));
  const m1a = uniq([...newWords, ...recent]);

  // M1-A (cluster) + M2 (confusables) ne plantent jamais.
  for (const t of m1a) verifyOptions(buildOptions, t, pool, 4, `S${s.id} M1-A ${t.slug}`, true);
  for (const t of newWords.slice(0, M2_ITEMS))
    verifyOptions(buildConfusableOptions, t, pool, 4, `S${s.id} M2 ${t.slug}`, false);

  // Spirale image→audio (cluster, 3 options) si applicable.
  if (s.spiral === "retrieval_image_to_audio")
    for (const t of review.slice(0, SPIRAL_ITEMS))
      verifyOptions(buildOptions, t, pool, 3, `S${s.id} M1-B ${t.slug}`, true);

  // Tri : au moins une catégorie (clusters présents dans le pool).
  if (s.spiral === "tri") {
    checks++;
    const cats = new Set(pool.map((w) => w.cluster));
    if (cats.size < 1) err(`S${s.id} tri: aucune catégorie.`);
    for (const t of review.slice(0, SPIRAL_ITEMS))
      if (!cats.has(t.cluster)) err(`S${s.id} tri: catégorie cible « ${t.cluster} » absente.`);
  }

  // Files convergentes (parfait + fautif).
  simulateQueue(m1a, 0, `S${s.id} file (parfait)`);
  simulateQueue(m1a, 2, `S${s.id} file (2 erreurs/mot)`);

  // Estimation d'interactions (jeu parfait) ∈ [50, 80].
  let est = newWords.length + m1a.length + Math.min(newWords.length, M2_ITEMS);
  if (s.spiral === "tri" || s.spiral === "retrieval_image_to_audio")
    est += Math.min(review.length, SPIRAL_ITEMS);
  else if (s.spiral === "memory") est += Math.min(MEMORY_PAIRS, review.length);
  est += Math.max(m1a.length, SPRINT_MIN); // sprint
  checks++;
  const tag = est >= 50 && est <= 80 ? "✓" : "✗";
  if (est < 50 || est > 80) err(`S${s.id}: ${est} interactions hors cible 50–80.`);
  console.log(`  ${tag} S${s.id} (${s.spiral ?? "sans spirale"}) ≈ ${est} interactions`);
}

// --- Test léger : un distracteur confondable est tiré s'il est introduit ----
// Pour chaque slug ayant des voisins, on construit un pool contenant la cible,
// ses voisins, et quelques mots du même cluster. M2 doit privilégier au moins
// un voisin confondable (présent dans le pool) parmi les distracteurs.
{
  const FILL = 4;
  for (const [slug, neighbours] of Object.entries(confMap)) {
    const target = words.get(slug);
    if (!target) continue;
    const neighWords = [...neighbours].map((s) => words.get(s)).filter(Boolean);
    if (neighWords.length === 0) continue;
    const sameCluster = [...words.values()].filter(
      (w) => w.cluster === target.cluster && w.slug !== slug,
    );
    const pool = uniq([target, ...neighWords, ...sameCluster.slice(0, FILL)]);
    // Plusieurs tirages (mélange) : un voisin doit apparaître à chaque fois.
    let ok = true;
    for (let r = 0; r < 6; r++) {
      const opts = buildConfusableOptions(target, pool, 4).map((w) => w.slug);
      if (!opts.some((o) => neighbours.has(o))) ok = false;
    }
    checks++;
    if (!ok) err(`M2 confusables : aucun voisin tiré pour « ${slug} » (pool l'inclut).`);
  }
}

console.log(`sim-session: ${checks} vérifications.`);
if (fail) {
  console.error(`✗ sim-session: ${fail} échec(s).`);
  process.exit(1);
}
console.log("✓ sim-session: distracteurs OK, files convergentes, 50–80 interactions/session.");
