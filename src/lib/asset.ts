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
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "");
}
