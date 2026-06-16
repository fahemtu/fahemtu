// Fahemtu — Palier 1 protection du contenu : upload des assets (audio + images)
// vers le bucket Supabase PRIVÉ « produit-1 », en conservant le chemin relatif
// (images/chat.png, audio/chat.mp3).
//
// N'altère NI l'app NI les fichiers publics : les assets restent aussi dans le
// build public pour l'instant (on les retirera dans un palier ultérieur).
//
// Par défaut : DRY-RUN (liste ce qui serait uploadé, sans rien envoyer, sans
// besoin de secrets). Upload réel : ajouter le drapeau --upload.
//
// Secrets : jamais en dur. Lus depuis l'env (process.env), avec repli sur
// /site/.env.local (où vivent déjà SUPABASE_URL et SUPABASE_SECRET_KEY).
//
// Lancer :
//   node scripts/upload-assets.mjs            # dry-run (détection seule)
//   node scripts/upload-assets.mjs --upload   # upload réel (nécessite les secrets)

import {
  readdirSync,
  readFileSync,
  existsSync,
  statSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, extname, posix } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BUCKET = process.env.SUPABASE_BUCKET || "produit-1";

// Dossiers source → préfixe de destination dans le bucket.
const SOURCES = [
  { dir: "public/images", prefix: "images" },
  { dir: "public/audio", prefix: "audio" },
];

// Types média gérés (tout autre fichier — ex. manifest.csv — est ignoré).
const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
};

const UPLOAD = process.argv.includes("--upload");

// --- Détection des fichiers -------------------------------------------------
/** Liste récursive des fichiers d'un dossier, chemins relatifs au dossier. */
function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out.push(full);
  }
  return out;
}

const plan = [];
const skipped = [];
for (const { dir, prefix } of SOURCES) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) {
    console.warn(`⚠ dossier introuvable : ${dir} (ignoré)`);
    continue;
  }
  for (const file of walk(abs)) {
    const ext = extname(file).toLowerCase();
    const rel = file.slice(abs.length + 1).split(/[\\/]/).join("/");
    const dest = posix.join(prefix, rel);
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) {
      skipped.push(dest);
      continue;
    }
    plan.push({ file, dest, contentType, size: statSync(file).size });
  }
}

plan.sort((a, b) => a.dest.localeCompare(b.dest));

const totalBytes = plan.reduce((n, f) => n + f.size, 0);
const mb = (b) => (b / 1024 / 1024).toFixed(2);
const byPrefix = (p) => plan.filter((f) => f.dest.startsWith(p + "/")).length;

// --- Env (uniquement pour l'upload réel) ------------------------------------
function loadEnv() {
  const env = { ...process.env };
  // Repli : /site/.env.local (KEY=VALUE), sans écraser ce qui est déjà défini.
  const file = join(ROOT, "site", ".env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2];
    }
  }
  return env;
}

// --- Exécution --------------------------------------------------------------
async function main() {
  console.log(
    `Bucket « ${BUCKET} » · ${plan.length} fichiers détectés ` +
      `(images: ${byPrefix("images")}, audio: ${byPrefix("audio")}) · ${mb(totalBytes)} Mo`,
  );
  if (skipped.length) {
    console.log(`Ignorés (type non géré) : ${skipped.join(", ")}`);
  }

  if (!UPLOAD) {
    console.log("\n— DRY-RUN — (aucun upload ; ajouter --upload pour envoyer)\n");
    for (const f of plan) console.log(`  • ${f.dest}  (${mb(f.size)} Mo, ${f.contentType})`);
    console.log(`\nTotal : ${plan.length} fichiers, ${mb(totalBytes)} Mo.`);
    return;
  }

  // Upload réel : secrets requis.
  const env = loadEnv();
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error(
      "✗ SUPABASE_URL et SUPABASE_SECRET_KEY requis (env ou site/.env.local).",
    );
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let ok = 0;
  const failures = [];
  for (const f of plan) {
    const body = readFileSync(f.file);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(f.dest, body, { contentType: f.contentType, upsert: true });
    if (error) {
      failures.push({ dest: f.dest, message: error.message });
      console.error(`  ✗ ${f.dest} — ${error.message}`);
    } else {
      ok++;
      console.log(`  ✓ ${f.dest}`);
    }
  }

  console.log(
    `\nTerminé : ${ok}/${plan.length} uploadés, ${failures.length} échec(s), ${mb(totalBytes)} Mo.`,
  );
  if (failures.length) process.exit(1);
}

main().catch((err) => {
  console.error("✗ erreur :", err);
  process.exit(1);
});
