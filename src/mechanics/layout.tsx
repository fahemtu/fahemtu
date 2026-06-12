// Fahemtu — Produit 1 : primitives de layout des écrans de session.
// Objectif : un écran de jeu tient TOUJOURS dans le viewport visible, sans
// scroll. Le runner est une colonne flex de hauteur fixe ; le chrome (barre,
// consigne, contrôle) ne rétrécit pas, et la grille de choix occupe la place
// restante en se redimensionnant (les tuiles rétrécissent pour tenir).

import type { CSSProperties, ReactNode } from "react";

/** Colonne plein-écran, sans débordement. */
export function SessionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
      {children}
    </div>
  );
}

/**
 * Grille qui remplit la hauteur disponible sans scroll.
 *
 * - `square` (défaut) : cellules CARRÉES, centrées, taille cappée (`cap`).
 *   Le côté = min(largeur/colonne, hauteur/rangée, cap) → carrés plus petits
 *   sur écran large/court, limités par la largeur sur écran haut. Pour les
 *   tuiles image (M1-A, M2, preuve, cartes image de mémoire).
 * - `square={false}` : cellules étirées (`1fr`) qui remplissent la hauteur.
 *   Pour le tri (boutons catégorie avec libellé).
 */
export function FitGrid({
  count,
  cols,
  children,
  square = true,
  cap = 240,
}: {
  count: number;
  cols: number;
  children: ReactNode;
  square?: boolean;
  cap?: number;
}) {
  const rows = Math.max(1, Math.ceil(count / cols));

  if (!square) {
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

  return (
    <div className="mt-4 min-h-0 flex-1" style={{ containerType: "size" }}>
      <div
        className="fit-grid-square"
        style={
          {
            "--cols": cols,
            "--rows": rows,
            "--cap": `${cap}px`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
