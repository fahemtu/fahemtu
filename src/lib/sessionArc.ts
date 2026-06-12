// Fahemtu — Produit 1 : construction de l'arc d'une session en « blocs » (§5).
//
// Arc d'une session de contenu (S1–S7) :
//   1. découverte (nouveaux mots, audio+image simultanés)
//   2. récupération audio→image (M1-A) sur nouveaux + récents
//   3. discrimination (M2) — quelques items (distracteurs phonétiques)
//   4. révision spiralée sur les mots des sessions précédentes, mécanique
//      rotative selon `session.spiralMechanic` (absente en S1)
//   5. sprint audio (M4) sur les mots de la session
//
// Cible : 50–80 interactions par session (cf. estimateInteractions / sim).

import type { Session, Mechanic } from "../content/sessions";
import { SESSIONS, reviewWordsFor } from "../content/sessions";
import { wordBySlug, type Word } from "../content/words";
import { shuffle } from "./shuffle";
import type { Direction } from "../mechanics/AudioImageChoice";

export type Block =
  | { kind: "decouverte"; words: Word[] }
  | {
      kind: "choice";
      direction: Direction;
      builder: "cluster" | "confusable";
      consigne: string;
      words: Word[];
      pool: Word[];
    }
  | { kind: "tri"; words: Word[]; pool: Word[] }
  | { kind: "memory"; words: Word[]; pool: Word[]; pairs: number }
  | { kind: "sprint"; words: Word[]; pool: Word[]; count: number };

// Dimensionnement (vise 50–80 interactions/session, cf. sim-session).
const M2_ITEMS = 10; // discrimination
const SPIRAL_ITEMS = 12; // révision spiralée (tri / image→audio)
const MEMORY_PAIRS = 6; // révision mémoire
const SPRINT_MIN = 20; // longueur minimale du sprint (tempo)

const toWords = (slugs: string[]): Word[] =>
  slugs.map((s) => wordBySlug[s]).filter(Boolean);

function uniqueWords(words: Word[]): Word[] {
  const seen = new Set<string>();
  return words.filter((w) => (seen.has(w.slug) ? false : (seen.add(w.slug), true)));
}

const sample = (words: Word[], cap: number): Word[] => shuffle(words).slice(0, cap);

function spiralBlock(
  mechanic: Mechanic,
  review: Word[],
  pool: Word[],
): Block | null {
  if (review.length === 0) return null;
  switch (mechanic) {
    case "tri":
      return { kind: "tri", words: sample(review, SPIRAL_ITEMS), pool };
    case "retrieval_image_to_audio":
      return {
        kind: "choice",
        direction: "image_to_audio",
        builder: "cluster",
        consigne: "Regarde l'image, puis choisis le bon son.",
        words: sample(review, SPIRAL_ITEMS),
        pool,
      };
    case "memory":
      return {
        kind: "memory",
        words: review,
        pool,
        pairs: Math.min(MEMORY_PAIRS, review.length),
      };
    default:
      return null; // découverte/sprint/discrimination ne sont pas des spirales
  }
}

export function buildSessionBlocks(session: Session): Block[] {
  if (session.isProof) return []; // moment de preuve : étape 6

  const newWords = toWords(session.newWords);
  if (newWords.length === 0) return [];

  const reviewSlugs = reviewWordsFor(session.id);
  const review = toWords(reviewSlugs);
  const prev = SESSIONS.find((s) => s.id === session.id - 1);
  const recent = toWords(prev?.newWords ?? []);
  const pool = toWords([...reviewSlugs, ...session.newWords]);

  const m1aWords = uniqueWords([...newWords, ...recent]); // nouveaux + récents
  const sprintCount = Math.max(m1aWords.length, SPRINT_MIN);

  const blocks: Block[] = [
    { kind: "decouverte", words: newWords },
    {
      kind: "choice",
      direction: "audio_to_image",
      builder: "cluster",
      consigne: "Écoute, puis choisis l'image.",
      words: m1aWords,
      pool,
    },
    {
      kind: "choice",
      direction: "audio_to_image",
      builder: "confusable",
      consigne: "Écoute bien la différence, puis choisis l'image.",
      words: sample(newWords, M2_ITEMS),
      pool,
    },
  ];

  if (session.spiralMechanic) {
    const sp = spiralBlock(session.spiralMechanic, review, pool);
    if (sp) blocks.push(sp);
  }

  blocks.push({ kind: "sprint", words: m1aWords, pool, count: sprintCount });
  return blocks;
}

/** Estimation d'interactions (jeu parfait) — sert au check 50–80 (sim). */
export function estimateInteractions(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.kind === "memory") n += b.pairs;
    else if (b.kind === "sprint") n += b.count;
    else n += b.words.length;
  }
  return n;
}
