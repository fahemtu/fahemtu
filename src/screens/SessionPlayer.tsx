// Fahemtu — Produit 1 : lecteur de session.
// Déroule les blocs de l'arc (§5) l'un après l'autre. À la fin, va au résumé.
// La persistance (session complétée, mots maîtrisés) arrive à l'étape 5 ;
// quitter en cours (bouton accueil) ne marque rien (§8).

import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "../app/navigation-context";
import { SESSIONS } from "../content/sessions";
import { buildSessionBlocks } from "../lib/sessionArc";
import { preloadWords } from "../lib/assets";
import { Discovery } from "../mechanics/Discovery";
import { M1Retrieval } from "../mechanics/M1Retrieval";

export function SessionPlayer({ sessionId }: { sessionId: number }) {
  const { navigate, goHome } = useNavigation();
  const session = SESSIONS.find((s) => s.id === sessionId);
  const blocks = useMemo(
    () => (session ? buildSessionBlocks(session) : []),
    [session],
  );
  const [blockIndex, setBlockIndex] = useState(0);

  // Précharge tous les assets de la session dès l'entrée (feedback < 300 ms).
  useEffect(() => {
    for (const b of blocks) preloadWords(b.words);
  }, [blocks]);

  const done = blockIndex >= blocks.length;

  // Fin de session → résumé inter-session.
  useEffect(() => {
    if (session && !session.isProof && blocks.length > 0 && done) {
      navigate({ name: "summary", sessionId });
    }
  }, [done, session, blocks.length, navigate, sessionId]);

  if (!session) {
    return (
      <CenteredNote
        title="Session introuvable"
        body="Cette session n'existe pas."
        cta="Retour à la carte"
        onCta={goHome}
      />
    );
  }

  if (session.isProof) {
    return (
      <CenteredNote
        title="Moment de preuve"
        body="La rafale sur les 67 mots arrive à l'étape 6."
        cta="Retour à la carte"
        onCta={goHome}
      />
    );
  }

  if (blocks.length === 0 || done) return null; // redirection en cours

  const block = blocks[blockIndex];
  const next = () => setBlockIndex((i) => i + 1);

  switch (block.kind) {
    case "decouverte":
      return <Discovery key={blockIndex} words={block.words} onComplete={next} />;
    case "retrieval_audio_to_image":
      return (
        <M1Retrieval
          key={blockIndex}
          direction="audio_to_image"
          words={block.words}
          pool={block.pool}
          onComplete={next}
        />
      );
    case "retrieval_image_to_audio":
      return (
        <M1Retrieval
          key={blockIndex}
          direction="image_to_audio"
          words={block.words}
          pool={block.pool}
          onComplete={next}
        />
      );
  }
}

function CenteredNote({
  title,
  body,
  cta,
  onCta,
}: {
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="text-ink/70">{body}</p>
      <button
        type="button"
        onClick={onCta}
        className="rounded-xl bg-teal px-5 py-2 text-sm font-semibold text-creme hover:opacity-90"
      >
        {cta}
      </button>
    </div>
  );
}
