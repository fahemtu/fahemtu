// Fahemtu — Produit 1 : préchargement des assets.
// Objectif : feedback < 300 ms. On précharge l'audio et les images des mots
// d'une étape avant de jouer, pour éviter toute latence au premier item.

import type { Word } from "../content/words";
import { asset } from "./asset";

const preloadedAudio = new Set<string>();
const preloadedImages = new Set<string>();

function preloadAudio(src: string): void {
  if (preloadedAudio.has(src)) return;
  preloadedAudio.add(src);
  const el = new Audio();
  el.preload = "auto";
  el.src = asset(src);
}

function preloadImage(src: string): void {
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const img = new Image();
  img.src = asset(src);
}

/** Précharge audio + image de chaque mot (les tuiles `hex` n'ont rien à charger). */
export function preloadWords(words: Word[]): void {
  for (const w of words) {
    if (w.audio) preloadAudio(w.audio);
    if (w.image) preloadImage(w.image);
  }
}
