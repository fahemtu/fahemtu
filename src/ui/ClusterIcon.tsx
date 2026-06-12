// Fahemtu — Produit 1 : icônes de cluster (chrome pour M3, tri par catégorie).
// Pictogrammes simples, `currentColor`. Purement indicatifs (libellé FR à côté).

import type { Cluster } from "../content/words";

type Props = { className?: string };

function Svg({ children, className }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const ICONS: Record<Cluster, (p: Props) => React.ReactNode> = {
  // Patte (animaux)
  animaux: (p) => (
    <Svg {...p}>
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M7.5 16.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4-2 3-4.5 3-4.5-.5-4.5-3Z" />
    </Svg>
  ),
  // Pastille (couleurs)
  couleurs: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16" fill="currentColor" stroke="none" opacity="0.25" />
    </Svg>
  ),
  // Main (corps)
  corps: (p) => (
    <Svg {...p}>
      <path d="M8 11V6.5a1.3 1.3 0 0 1 2.6 0V10m0-1.5a1.3 1.3 0 0 1 2.6 0V10m0-.5a1.3 1.3 0 0 1 2.6 0V13c0 3.3-2 6-5 6s-4.8-1.8-5.6-3.8L7 13" />
    </Svg>
  ),
  // Personne (gens)
  gens: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    </Svg>
  ),
  // Tasse (manger & boire)
  manger: (p) => (
    <Svg {...p}>
      <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
      <path d="M16 9h2.2a2 2 0 0 1 0 4H16" />
      <path d="M8 3.5v1.5M11.5 3.5v1.5" />
    </Svg>
  ),
};

export function ClusterIcon({
  cluster,
  className,
}: {
  cluster: Cluster;
  className?: string;
}) {
  return <>{ICONS[cluster]({ className })}</>;
}
