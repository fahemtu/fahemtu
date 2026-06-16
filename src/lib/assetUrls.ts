// Fahemtu — store des URLs signées des assets (palier 3).
// Map chargée une fois après autorisation (cf. fetchAssetUrls + AuthGate), puis
// consultée synchroniquement par asset(). Clés = clés de bucket : « images/<slug>.png »,
// « audio/<slug>.mp3 ». Tant que rien n'est chargé, asset() retombe sur le statique.

let signedUrls: Record<string, string> | null = null;

/** Alimente le store avec la map { "images/x.png": url, "audio/x.mp3": url }. */
export function setAssetUrls(map: Record<string, string>): void {
  signedUrls = map;
}

/** Vrai une fois la map chargée. */
export function assetUrlsLoaded(): boolean {
  return signedUrls !== null;
}

/** Normalise un chemin entrant (« /images/x.png » ou « images/x.png ») en clé bucket. */
function toBucketKey(path: string): string {
  return path.replace(/^\/+/, "");
}

/** URL signée pour un chemin, ou undefined si absente / store non chargé. */
export function getSignedUrl(path: string): string | undefined {
  if (!signedUrls) return undefined;
  return signedUrls[toBucketKey(path)];
}
