// Fahemtu — Produit 1 : M5, mémoire image / son.
// Grille de cartes : moitié images, moitié cartes son (tap = jouer l'audio).
// Apparier chaque image à son son. Match → cartes restent retournées ;
// erreur → retour face cachée. Aucune écriture arabe sur les cartes.

import { useEffect, useMemo, useRef, useState } from "react";
import { useSound } from "../app/sound-context";
import { SpeakerIcon } from "../app/icons";
import { WordImage } from "../ui/WordImage";
import { shuffle } from "../lib/shuffle";
import { ADVANCE_MS, REVEAL_MS, type MechanicProps } from "./types";
import { ProgressBar } from "./ProgressBar";
import { FitGrid, SessionLayout } from "./layout";

type Kind = "image" | "sound";
interface Card {
  id: string; // `${slug}-${kind}`
  slug: string;
  kind: Kind;
}

export function Memory({
  words,
  onComplete,
  onWordMastered,
  pairs,
}: MechanicProps & { pairs: number }) {
  const { play } = useSound();

  const { cards, pairWords } = useMemo(() => {
    const chosen = shuffle(words).slice(0, Math.min(pairs, words.length));
    const deck: Card[] = chosen.flatMap((w) => [
      { id: `${w.slug}-image`, slug: w.slug, kind: "image" as const },
      { id: `${w.slug}-sound`, slug: w.slug, kind: "sound" as const },
    ]);
    return { cards: shuffle(deck), pairWords: chosen };
  }, [words, pairs]);

  const wordOf = useMemo(
    () => Object.fromEntries(pairWords.map((w) => [w.slug, w])),
    [pairWords],
  );

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Card[]>([]);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const doneRef = useRef(false);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const total = pairWords.length;

  function tap(card: Card) {
    if (busy) return;
    if (matched.has(card.slug)) return;
    if (revealed.some((c) => c.id === card.id)) return;

    if (card.kind === "sound") play(wordOf[card.slug].audio);

    const next = [...revealed, card];
    setRevealed(next);
    if (next.length < 2) return;

    const [a, b] = next;
    const isMatch = a.slug === b.slug && a.kind !== b.kind;
    setBusy(true);
    timerRef.current = window.setTimeout(
      () => {
        setRevealed([]);
        setBusy(false);
        if (isMatch) {
          onWordMastered?.(a.slug);
          setMatched((prev) => {
            const m = new Set(prev).add(a.slug);
            if (m.size === total && !doneRef.current) {
              doneRef.current = true;
              onComplete();
            }
            return m;
          });
        }
      },
      isMatch ? ADVANCE_MS : REVEAL_MS,
    );
  }

  function ringFor(card: Card): string {
    const isUp = revealed.some((c) => c.id === card.id);
    if (matched.has(card.slug)) return "ring-2 ring-teal";
    if (isUp && revealed.length === 2) {
      const isMatch = revealed[0].slug === revealed[1].slug;
      return isMatch ? "ring-2 ring-teal" : "ring-2 ring-[#D64541]";
    }
    if (isUp) return "ring-2 ring-ocre";
    return "ring-1 ring-ink/10 hover:ring-ocre/60";
  }

  // Mobile : 3 colonnes (cartes plus grandes) ; à partir de sm : 4 colonnes.
  // Colonnes fixes ; la grille (FitGrid) se redimensionne en hauteur.
  const cols = cards.length <= 6 ? 3 : 4;

  return (
    <SessionLayout>
      <div className="shrink-0">
        <ProgressBar done={matched.size} total={total} />
      </div>

      <p className="mt-4 shrink-0 text-center text-sm font-medium text-ink/60">
        Associe chaque image à son son.
      </p>

      <FitGrid count={cards.length} cols={cols} cap={160}>
        {cards.map((card) => {
          const isUp = matched.has(card.slug) || revealed.some((c) => c.id === card.id);
          const word = wordOf[card.slug];
          return (
            <button
              key={card.id}
              type="button"
              disabled={busy || matched.has(card.slug)}
              onClick={() => tap(card)}
              aria-label={card.kind === "sound" ? "Carte son" : "Carte image"}
              className={`grid aspect-square min-h-0 touch-manipulation select-none place-items-center overflow-hidden rounded-2xl bg-white p-2 ${ringFor(
                card,
              )}`}
            >
              {!isUp ? (
                <span className="h-3 w-3 rounded-full bg-ink/20" />
              ) : card.kind === "image" ? (
                <WordImage word={word} />
              ) : (
                <SpeakerIcon className="h-8 w-8 text-teal" />
              )}
            </button>
          );
        })}
      </FitGrid>
    </SessionLayout>
  );
}
