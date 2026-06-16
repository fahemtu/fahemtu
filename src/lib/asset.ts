// Fahemtu — Produit 1 : résolution d'URL des assets publics.
//
// Les fichiers de `public/` (audio, images) sont servis sous la base de
// déploiement. En dur, un chemin absolu « /images/x.png » ne marche QUE si
// l'app est servie à la racine ; il casse dès que la base n'est pas « / »
// (sous-chemin, preview, déploiement). On préfixe donc toujours par
// `import.meta.env.BASE_URL` (toujours terminé par « / »).
//
// Accepte « /images/x.png » ou « images/x.png » ; renvoie p.ex. « /images/x.png »
// à la racine, « /sous-chemin/images/x.png » sous une base.
//
// Palier 3 : si une URL signée existe dans le store (assets du bucket privé,
// chargés après autorisation), on la renvoie en priorité. Sinon, repli sur la
// résolution statique → rien ne casse pendant la transition. Reste synchrone
// (le store est chargé avant le rendu de l'app, via l'AuthGate).
import { getSignedUrl } from "./assetUrls";

export function asset(path: string): string {
  const signed = getSignedUrl(path);
  if (signed) return signed;
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "");
}
