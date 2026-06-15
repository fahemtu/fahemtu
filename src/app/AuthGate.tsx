// Fahemtu — couche d'accès au-dessus de l'app (login + autorisation).
// Encapsule le rendu : l'app existante n'est rendue QUE si l'utilisateur est
// connecté ET autorisé (entitlement « produit-1 »). Aucune logique de l'app
// (navigation, écrans, mécaniques, contenu) n'est touchée.
//
// 4 états : chargement · non connecté (lien magique) · connecté sans accès ·
// connecté + autorisé (→ app + bouton discret de déconnexion).

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// URL de la page produit (placeholder, à configurer plus tard).
const PRODUCT_PAGE_URL = "#";
const PRODUCT = "produit-1";

type Phase = "loading" | "ready";

export function AuthGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  // null = vérification en cours ; true/false = résultat.
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Session initiale + écoute des changements d'auth. On (ré)initialise
  // `authorized` à null (= « à vérifier ») dans ces callbacks async — pas dans
  // un effet synchrone. On ne fait PAS d'appel Supabase dans onAuthStateChange
  // (risque de blocage) : la vérification a lieu dans l'effet ci-dessous.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthorized(null);
      setPhase("ready");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setAuthorized(null);
      setPhase("ready");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Vérification d'autorisation à chaque changement de session.
  useEffect(() => {
    if (phase !== "ready" || !session) return;
    let active = true;
    supabase
      .from("entitlements")
      .select("product")
      .eq("product", PRODUCT)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("[auth] vérification d'accès :", error.message);
        setAuthorized(!error && !!data);
      });
    return () => {
      active = false;
    };
  }, [phase, session]);

  const signOut = useCallback(() => {
    void supabase.auth.signOut();
  }, []);

  // — Chargement (session initiale, ou vérification d'accès en cours) —
  if (phase === "loading" || (session && authorized === null)) {
    return <LoadingScreen />;
  }

  // — Non connecté —
  if (!session) {
    return <SignInScreen />;
  }

  // — Connecté mais sans accès —
  if (!authorized) {
    return <NoAccessScreen email={session.user.email} onSignOut={signOut} />;
  }

  // — Connecté + autorisé : l'app, intacte, + déconnexion discrète —
  return (
    <>
      {children}
      <button
        type="button"
        onClick={signOut}
        className="fixed bottom-2 left-2 z-50 rounded px-2 py-1 text-[11px] font-medium text-ink/40 hover:text-ink/70"
      >
        Se déconnecter
      </button>
    </>
  );
}

/** Fond crème identique à l'app → pas de flash entre les états. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-creme px-6 text-ink">
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <Shell>
      <p className="text-sm text-ink/40" aria-live="polite">
        Chargement…
      </p>
    </Shell>
  );
}

function mapAuthError(message: string, status?: number): string {
  const m = message.toLowerCase();
  if (status === 429 || m.includes("rate")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "Adresse email invalide.";
  }
  return "Impossible d'envoyer le lien pour le moment. Réessaie.";
}

function SignInScreen() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      setError(mapAuthError(error.message, error.status));
      return;
    }
    setSent(true);
  }

  return (
    <Shell>
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight">Fahemtu</h1>

        {sent ? (
          <p className="mt-6 text-ink/70">
            Vérifie ta boîte mail et clique sur le lien de connexion.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink/60">
              Connecte-toi pour accéder à ton parcours.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                aria-label="Adresse email"
                className="rounded-lg bg-white px-3 py-2.5 text-center ring-1 ring-ink/15"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-creme hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "Envoi…" : "Recevoir le lien de connexion"}
              </button>
            </form>
            {error && (
              <p className="mt-3 text-sm text-[#D64541]" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}

function NoAccessScreen({
  email,
  onSignOut,
}: {
  email?: string;
  onSignOut: () => void;
}) {
  return (
    <Shell>
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-bold tracking-tight">
          Tu n'as pas encore accès à ce produit
        </h1>
        {email && <p className="mt-2 text-sm text-ink/50">Connecté en tant que {email}</p>}
        <a
          href={PRODUCT_PAGE_URL}
          className="mt-6 inline-block rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-creme hover:opacity-90"
        >
          Voir le produit
        </a>
        <div className="mt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="text-sm font-medium text-ink/50 hover:text-ink/80"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </Shell>
  );
}
