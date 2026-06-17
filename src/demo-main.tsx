// Fahemtu — Produit 0 (avant-goût gratuit) : point de montage ISOLÉ.
// N'importe AUCUN code payant (ni AuthGate, ni supabase, ni fetchAssetUrls).
// Assets servis depuis le public (repli statique de asset()), sans /api ni auth.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import "./index.css";
import { DemoApp } from "./demo/DemoApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
