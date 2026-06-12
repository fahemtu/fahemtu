// Fahemtu — Produit 1 : lecteur de session.
// Déroule les blocs de l'arc (§5) l'un après l'autre. À la fin : marque la
// session complétée et va au résumé. Quitter en cours (bouton accueil) ne
// marque rien (§8) — completeSession n'est appelé qu'à la toute fin.

import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "../app/navigation-context";
import { useProgress } from "../app/progress-context";
import { SESSIONS } from "../content/sessions";
import { buildSessionBlocks } from "../lib/sessionArc";
import { preloadWords } from "../lib/assets";
import { buildConfusableOptions, buildOptions } from "../lib/distractors";
import { ProofPlayer } from "./ProofPlayer";
import { Discovery } from "../mechanics/Discovery";
import { AudioImageChoice } from "../mechanics/AudioImageChoice";
import { Tri } from "../mechanics/Tri";
import { Sprint } from "../mechanics/Sprint";
import { Memory } from "../mechanics/Memory";

export function SessionPlayer({ sessionId }: { sessionId: number }) {
  const { navigate, goHome } = useNavigation();
  const { recordMastered, completeSession } = useProgress();
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

  // Fin de session → marque complétée puis va au résumé inter-session.
  useEffect(() => {
    if (session && !session.isProof && blocks.length > 0 && done) {
      completeSession(sessionId);
      navigate({ name: "summary", sessionId });
    }
  }, [done, session, blocks.length, navigate, sessionId, completeSession]);

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

  if (session.isProof) return <ProofPlayer />;

  if (blocks.length === 0 || done) return null; // redirection en cours

  const block = blocks[blockIndex];
  const next = () => setBlockIndex((i) => i + 1);

  switch (block.kind) {
    case "decouverte":
      return <Discovery key={blockIndex} words={block.words} onComplete={next} />;
    case "choice":
      return (
        <AudioImageChoice
          key={blockIndex}
          direction={block.direction}
          consigne={block.consigne}
          optionBuilder={
            block.builder === "confusable" ? buildConfusableOptions : buildOptions
          }
          words={block.words}
          pool={block.pool}
          onComplete={next}
          onWordMastered={recordMastered}
        />
      );
    case "tri":
      return (
        <Tri
          key={blockIndex}
          words={block.words}
          pool={block.pool}
          onComplete={next}
          onWordMastered={recordMastered}
        />
      );
    case "memory":
      return (
        <Memory
          key={blockIndex}
          words={block.words}
          pool={block.pool}
          pairs={block.pairs}
          onComplete={next}
          onWordMastered={recordMastered}
        />
      );
    case "sprint":
      return (
        <Sprint
          key={blockIndex}
          words={block.words}
          pool={block.pool}
          count={block.count}
          onComplete={next}
          onWordMastered={recordMastered}
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
