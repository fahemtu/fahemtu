// Fahemtu — Produit 1 : primitives de layout des écrans de session.
// Objectif : un écran de jeu tient TOUJOURS dans le viewport visible, sans
// scroll. Le runner est une colonne flex de hauteur fixe ; le chrome (barre,
// consigne, contrôle) ne rétrécit pas, et la grille de choix occupe la place
// restante en se redimensionnant (les tuiles rétrécissent pour tenir).

import type { ReactNode } from "react";

/** Colonne plein-écran, sans débordement. */
export function SessionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
      {children}
    </div>
  );
}

/**
 * Grille qui remplit la hauteur disponible. `minmax(0, 1fr)` autorise les
 * cellules à rétrécir sous la taille de leur contenu → jamais de débordement.
 */
export function FitGrid({
  count,
  cols,
  children,
}: {
  count: number;
  cols: number;
  children: ReactNode;
}) {
  const rows = Math.max(1, Math.ceil(count / cols));
  return (
    <div className="mt-4 min-h-0 flex-1">
      <div
        className="grid h-full gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
