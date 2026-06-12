// Fahemtu — Produit 1 : coquille d'application.
// Header sobre : marque + bouton « accueil » (avec confirmation pendant une
// session, §8 : une session quittée en cours n'est pas marquée complétée) +
// réglage « son ». Aucun chrome décoratif, aucun XP/vies/streak.

import { useState, type ReactNode } from "react";
import { useNavigation } from "./navigation-context";
import { useSound } from "./sound-context";
import { HomeIcon, SoundOffIcon, SoundOnIcon } from "./icons";

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-creme p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink/70">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-creme hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { route, goHome } = useNavigation();
  const { muted, toggleMuted } = useSound();
  const [confirmingExit, setConfirmingExit] = useState(false);

  const onHome = route.name === "home";
  // Quitter une session en cours doit être confirmé (perte de progression).
  const needsConfirm = route.name === "session";

  const handleHomeClick = () => {
    if (needsConfirm) setConfirmingExit(true);
    else goHome();
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!onHome && (
            <button
              type="button"
              onClick={handleHomeClick}
              aria-label="Retour à l'accueil"
              className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-ink/5"
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          )}
          <span className="font-semibold tracking-tight text-ink">Fahemtu</span>
        </div>

        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          aria-pressed={muted}
          className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-ink/5"
        >
          {muted ? (
            <SoundOffIcon className="h-5 w-5" />
          ) : (
            <SoundOnIcon className="h-5 w-5" />
          )}
        </button>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {confirmingExit && (
        <ConfirmDialog
          title="Quitter la session ?"
          body="Ta progression dans cette session ne sera pas enregistrée."
          confirmLabel="Quitter"
          cancelLabel="Continuer"
          onConfirm={() => {
            setConfirmingExit(false);
            goHome();
          }}
          onCancel={() => setConfirmingExit(false)}
        />
      )}
    </div>
  );
}
