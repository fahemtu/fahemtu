// Fahemtu — Produit 1 : configuration globale.

/**
 * Déverrouille toutes les sessions/phases pour le dev.
 * Lié automatiquement au mode : `true` en `vite dev`, `false` en build de prod
 * (import.meta.env.DEV) → impossible d'oublier le flag à `false` (critère §9).
 */
export const DEV_UNLOCK_ALL_PHASES = import.meta.env.DEV;

/** Clé localStorage de la progression (§8). */
export const STORAGE_KEY = "fahemtu.p1.progress";
