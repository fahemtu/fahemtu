# Fahemtu — Produit 1 : « Les mots qui débloquent l'arabe »
## Spécification de build (pour Claude Code)

Ce document est la **référence unique** pour construire le Produit 1. En cas de doute,
il prime sur toute interprétation. Périmètre : ce produit seul (67 mots, 8 sessions,
5 mécaniques). Ce n'est pas l'app complète à 4 phases.

---

## 0. Invariants ORAL-ONLY (non négociables)

Le produit enseigne la **compréhension de l'arabe à l'oreille**. Toute la conception en découle.

1. **Jamais d'écriture arabe affichée à l'apprenant** dans un item de compréhension.
   L'arabe vocalisé existe en données (champ `ar`) **pour référence/build uniquement**.
2. **Jamais la traduction française du mot cible** pendant un item de compréhension.
   Pas d'exercice de traduction. Le français n'apparaît que comme **chrome** :
   navigation, titres de session, libellés de cluster, consignes, écran de progression.
3. **Aucune lecture, écriture ou grammaire**, sous aucune forme.
4. **L'acte de compréhension est toujours `audio (arabe) ↔ image (sens)`.**
5. La **découverte** d'un mot se fait par présentation **simultanée audio + image**,
   jamais par du texte.

Si une mécanique semble exiger d'afficher de l'arabe ou une traduction → la mécanique est
mal conçue, pas l'invariant.

---

## 1. Stack & contraintes

- React + Vite + TypeScript + Tailwind CSS v4 (tokens via `@theme`).
- Persistance progression : `localStorage` pour l'instant (prêt à migrer vers Supabase
  quand le backend arrivera). Pas de backend requis pour jouer le Produit 1.
- Module **autonome** mais pensé pour s'insérer plus tard dans le bundle « Parcours
  complet » : mécaniques génériques pilotées par le contenu (ajouter un produit = ajouter
  du contenu + réutiliser les mécaniques).
- `DEV_UNLOCK_ALL_PHASES = false` avant tout build de prod.

### Tokens de marque (`@theme`)
```css
@theme {
  --color-creme: #F4EFE5;
  --color-ink:   #1A1816;
  --color-ocre:  #B8893E;
  --color-teal:  #2E5A56;
  --font-sans:   "Plus Jakarta Sans", system-ui, sans-serif;
  --font-arabic: "Noto Naskh Arabic", serif; /* surfaces dev/admin uniquement */
}
```

---

## 2. Modèle de données

```ts
export type Cluster = "gens" | "animaux" | "couleurs" | "manger" | "corps";

export interface Word {
  slug: string;     // ASCII, identique au nom de fichier audio/image
  fr: string;       // français — CHROME uniquement
  cluster: Cluster;
  ar: string;       // arabe vocalisé — RÉFÉRENCE/BUILD, jamais rendu à l'apprenant
  audio: string;    // "/audio/{slug}.mp3"
  image: string;    // "/images/{slug}.png"
}
```

### Source de contenu
- `src/content/words.ts` — tableau des 70 `Word`, **généré depuis `manifest.csv`**
  (la sortie du script audio : `francais → slug → arabe → fichier`).
- `src/content/sessions.ts` — définition des 8 sessions.
- `src/content/confusables.ts` — groupes de mots phonétiquement proches (mécanique 2).
- Assets : `public/audio/{slug}.mp3` et `public/images/{slug}.png`.

> ⚠️ Placement : les fichiers `*.ts` de `src/content/` doivent être **posés dans
> `src/content/` avant** tout run Claude Code. Ne pas les laisser ailleurs.

### Clusters (rappel des effectifs)
gens 7 · animaux 18 · couleurs 12 · manger 18 · corps 12 = **67**.

---

## 3. Les 5 mécaniques

Chaque mécanique reçoit une liste de `Word` (mots actifs de l'étape) et applique la
logique de distracteurs commune (§4). Feedback **< 300 ms**, pas de transition décorative.

### M1 — Récupération `audio ↔ image` (cœur, 2 directions)
- **Direction A — `audio → image`** : on joue l'audio d'un mot cible. L'apprenant choisit
  l'image correspondante dans une grille de **4 options** (1 cible + 3 distracteurs).
- **Direction B — `image → audio`** : on affiche l'image cible. On propose **3 boutons
  « son »** (icône haut-parleur) à écouter ; l'apprenant choisit celui qui correspond.
- Correct → avancer. Incorrect → feedback bref + le mot **revient dans la file** plus loin
  dans l'étape (pas d'aide gratuite). Sur erreur, **révéler brièvement la bonne réponse**
  (feedback correctif) tout en gardant la réinsertion en file : la révélation arrive *après*
  la tentative, jamais avant (anti-spectateur), et le mot revient pour une vraie récupération
  active plus tard.

### M2 — Discrimination (travail du son sur mots réels)
- On joue l'audio cible ; l'apprenant choisit parmi des images dont les mots sont
  **phonétiquement proches** (force à entendre la consonne précise).
- Pioche dans `confusables.ts`. Graine de départ : `qalb` (cœur) ↔ `kalb` (chien).
  Les autres groupes = mots partageant un phonème dur (ع ح خ ق ص ط ض) ou un squelette proche.
- `confusables.ts` est un **asset à curer** (à compléter par Karita ; voir §7).

### M3 — Tri par catégorie (clusters = catégories)
- On joue une série de mots ; l'apprenant les **dépose dans le bon cluster**.
- Catégories affichées par **libellé français + icône** (chrome admis). L'apprenant doit
  comprendre le mot entendu pour trier — c'est l'acte de compréhension.

### M4 — Sprint audio (tempo)
- Enchaînement rapide `audio → image` sur les mots de l'étape, rythme soutenu.
- Sert aussi de format au **moment de preuve** (§6).

### M5 — Mémoire image/son
- Grille de cartes : moitié **images**, moitié **cartes son** (tap = jouer l'audio).
- L'apprenant apparie chaque image à son son. Match → cartes restent retournées ;
  erreur → retour face cachée. Aucune écriture arabe sur les cartes.

---

## 4. Logique de distracteurs (commune)

- **Distracteurs proches d'abord** : tirés du **même cluster** que la cible (un chat se
  distingue d'un chien, pas d'une couleur). Évite l'élimination par catégorie.
- Fallback : si le cluster ne fournit pas assez de candidats déjà introduits, compléter
  avec des mots d'autres clusters **déjà vus**.
- **Jamais** de distracteur tiré d'un mot non encore introduit dans le parcours.
- Garantie d'intégrité : la sélection ne doit **jamais échouer** (toujours assez de
  candidats). Si impossible, réduire le nombre d'options plutôt que planter.

---

## 5. Structure des 8 sessions

Mots introduits par session (ordre verrouillé) :

| Session | Nouveaux mots | Nb |
|---|---|---|
| S1 | Animaux 1–10 | 10 |
| S2 | Animaux 11–18 + Couleurs 1–2 | 10 |
| S3 | Couleurs 3–12 | 10 |
| S4 | Corps 1–10 | 10 |
| S5 | Corps 11–12 + Gens 1–7 | 9 |
| S6 | Manger 1–9 | 9 |
| S7 | Manger 10–18 | 9 |
| S8 | — (moment de preuve, les 70) | 0 |

### Arc d'une session de contenu (S1–S7)
Cible : **50–80 interactions** par session.
1. **Découverte** des nouveaux mots (audio + image simultanés, micro-interaction de fixation).
2. **Récupération `audio → image`** (M1-A) sur nouveaux + récents.
3. **Discrimination** (M2) — quelques items.
4. **Révision spiralée** sur les mots des sessions précédentes, **mécanique rotative**
   pour varier le chemin de récupération :
   - S2 → M3 (tri) · S3 → M1-B (`image → audio`) · S4 → M5 (mémoire) ·
     S5 → M3 · S6 → M1-B · S7 → M5.
   - (S1 n'a pas de révision : première session.)
5. **Sprint audio** (M4) sur les mots de la session.

Principes (constitution anti-spectateur) à respecter : découverte avant révélation, pas
d'écran d'intro, distracteurs proches, anticipation forcée, pas d'XP / vies / streaks /
ligues / mascottes.

---

## 6. Moment de preuve (S8)

- **Rafale `audio → image`** sur les **67 mots**, ordre aléatoire, aucun nouvel
  enseignement.
- Écran de fin **sobre** : compteur **« 67 »** + ligne « Tu comprends 67 mots arabes
  à l'oreille. » Pas de score, pas d'étoiles, pas de confettis.
- C'est la transformation auto-vérifiable du produit : l'apprenant *constate* qu'il comprend.

---

## 7. Écrans / routes

- **Carte de parcours** (accueil) : 8 sessions, état d'avancement, compteur « mots compris ».
- **Onboarding** (~2 min, premier lancement) : pose la promesse + le geste audio↔image.
- **Lecteur de session** : déroule l'arc (§5).
- **Moment de preuve** (S8).
- **Résumé inter-session** : sobre, met à jour « mots compris ».
- Réglages minimaux : son, rejouer un audio.

---

## 8. Progression & état

- `localStorage` : sessions complétées, mots maîtrisés (= récupérés correctement ≥ 1 fois),
  compteur « mots compris ».
- Une session quittée en cours **n'est pas** marquée complétée.
- Pas de streak / XP / vies. Jalons sobres uniquement.

---

## 9. Critères d'acceptation (checks d'intégrité)

- [ ] Chaque `Word` a un `audio` et une `image` présents (check build vs manifest).
- [ ] Chaque session ne référence que des slugs définis.
- [ ] La sélection de distracteurs n'échoue jamais (zéro fallback cassé).
- [ ] **Aucune écriture arabe** rendue dans une surface de compréhension.
- [ ] **Aucune traduction française** du mot cible affichée pendant un item.
- [ ] Feedback < 300 ms.
- [ ] 50–80 interactions par session de contenu.
- [ ] `DEV_UNLOCK_ALL_PHASES = false` en build de prod.

---

## 10. Assets à fournir (hors build)

- **Audio** : 67 `.mp3` + `manifest.csv` (✅ généré ; retirer `batn`, `tifl`, `ra's` du manifest).
- **Images** : 67 `.png`, une par slug, **visuellement distinctes au sein de chaque
  cluster** (sinon les distracteurs proches ne tiennent pas). Cahier des charges image :
  fond transparent, sujet centré non ambigu, style cohérent sur les 67, nommage `{slug}.png`.
- **`confusables.ts`** : groupes phonétiquement proches (graine : `qalb`/`kalb`).
