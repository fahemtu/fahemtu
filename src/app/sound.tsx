// Fahemtu — Produit 1 : son centralisé.
// L'acte de compréhension passe par l'audio (arabe). Toute lecture passe ici
// pour respecter le réglage « son » et permettre « rejouer » (§7).

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SoundContext, type SoundValue } from "./sound-context";

const MUTE_KEY = "fahemtu.p1.muted";

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState<boolean>(readMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSrcRef = useRef<string | null>(null);

  // Élément audio unique réutilisé pour pouvoir interrompre une lecture.
  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    audioRef.current = el;
    return () => {
      el.pause();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(
    (src: string) => {
      lastSrcRef.current = src;
      if (muted) return;
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      el.src = src;
      el.currentTime = 0;
      // L'échec de lecture (ex. politique autoplay) ne doit pas casser l'item.
      void el.play().catch(() => {});
    },
    [muted],
  );

  const replay = useCallback(() => {
    if (lastSrcRef.current) play(lastSrcRef.current);
  }, [play]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* stockage indisponible : on garde l'état en mémoire */
      }
      if (next) audioRef.current?.pause();
      return next;
    });
  }, []);

  const value = useMemo<SoundValue>(
    () => ({ muted, toggleMuted, play, replay }),
    [muted, toggleMuted, play, replay],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
