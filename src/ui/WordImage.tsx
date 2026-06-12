// Fahemtu — Produit 1 : rendu visuel du SENS d'un mot.
// Image si disponible, sinon tuile pleine depuis `hex` (couleurs).
// Surface de compréhension : aucun texte arabe, aucune traduction FR visible.
// `alt` vide par défaut — l'image EST la réponse à identifier (audio ↔ image),
// la nommer trahirait l'exercice.

import type { Word } from "../content/words";

export function WordImage({
  word,
  className = "",
  alt = "",
}: {
  word: Word;
  className?: string;
  alt?: string;
}) {
  if (word.image) {
    return (
      <img
        src={word.image}
        alt={alt}
        draggable={false}
        className={`h-full w-full object-contain select-none ${className}`}
      />
    );
  }

  // Tuile couleur (pas d'image). Ring discret pour rester visible même en blanc.
  return (
    <div
      role="img"
      aria-label={alt || undefined}
      style={{ backgroundColor: word.hex }}
      className={`h-full w-full rounded-[inherit] ring-1 ring-inset ring-ink/10 ${className}`}
    />
  );
}
