// Fahemtu — Produit 1 : construction de l'arc d'une session en « blocs ».
//
// ÉTAPE 3 (en cours) : découverte → M1 audio→image → M1 image→audio sur les
// nouveaux mots, pour exercer le cœur dans les deux directions.
// ÉTAPE 4 (à venir) : arc complet (discrimination, révision spiralée selon
// `session.spiralMechanic`, sprint) et cible 50–80 interactions.

import type { Session } from "../content/sessions";
import { reviewWordsFor } from "../content/sessions";
import { wordBySlug, type Word } from "../content/words";

export type Block =
  | { kind: "decouverte"; words: Word[] }
  | { kind: "retrieval_audio_to_image"; words: Word[]; pool: Word[] }
  | { kind: "retrieval_image_to_audio"; words: Word[]; pool: Word[] };

const toWords = (slugs: string[]): Word[] =>
  slugs.map((s) => wordBySlug[s]).filter(Boolean);

/** Mots disponibles comme distracteurs une fois la découverte faite (§4). */
function poolFor(session: Session): Word[] {
  const prior = reviewWordsFor(session.id);
  return toWords([...prior, ...session.newWords]);
}

export function buildSessionBlocks(session: Session): Block[] {
  if (session.isProof) return []; // moment de preuve : étape 6

  const newWords = toWords(session.newWords);
  if (newWords.length === 0) return [];
  const pool = poolFor(session);

  return [
    { kind: "decouverte", words: newWords },
    { kind: "retrieval_audio_to_image", words: newWords, pool },
    { kind: "retrieval_image_to_audio", words: newWords, pool },
  ];
}
