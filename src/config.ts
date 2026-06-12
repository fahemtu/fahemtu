// Fahemtu — Produit 1 : configuration globale.

/**
 * Déverrouille toutes les sessions/phases pour le dev.
 * DOIT rester `false` en build de prod (critère d'acceptation §9).
 */
export const DEV_UNLOCK_ALL_PHASES = false;

/** Clé localStorage de la progression (§8). */
export const STORAGE_KEY = "fahemtu.p1.progress";
