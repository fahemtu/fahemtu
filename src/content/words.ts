// Fahemtu — Produit 1 : contenu des mots (généré depuis fahemtu-produit1-mots.csv).
// `ar` est une RÉFÉRENCE de build — ne jamais l'afficher à l'apprenant.
// Couleurs : pas d'image, rendues en tuile à partir de `hex`.

export type Cluster = "gens" | "animaux" | "couleurs" | "manger" | "corps";

export interface Word {
  slug: string;
  fr: string;        // français — chrome uniquement
  cluster: Cluster;
  ar: string;        // arabe vocalisé — référence/build, jamais rendu
  audio: string;     // "/audio/{slug}.mp3"
  image?: string;    // "/images/{slug}.png" — absent pour les couleurs
  hex?: string;      // couleur de tuile — couleurs uniquement
}

export const WORDS: Word[] = [
  { slug: "bebe", fr: "bébé", cluster: "gens", ar: "رَضِيع", audio: "/audio/bebe.mp3", image: "/images/bebe.png" },
  { slug: "garcon", fr: "garçon", cluster: "gens", ar: "وَلَد", audio: "/audio/garcon.mp3", image: "/images/garcon.png" },
  { slug: "fille", fr: "fille", cluster: "gens", ar: "بِنْت", audio: "/audio/fille.mp3", image: "/images/fille.png" },
  { slug: "homme", fr: "homme", cluster: "gens", ar: "رَجُل", audio: "/audio/homme.mp3", image: "/images/homme.png" },
  { slug: "femme", fr: "femme", cluster: "gens", ar: "اِمْرَأَة", audio: "/audio/femme.mp3", image: "/images/femme.png" },
  { slug: "vieil-homme", fr: "vieil homme", cluster: "gens", ar: "مُسِنّ", audio: "/audio/vieil-homme.mp3", image: "/images/vieil-homme.png" },
  { slug: "vieille-femme", fr: "vieille femme", cluster: "gens", ar: "مُسِنَّة", audio: "/audio/vieille-femme.mp3", image: "/images/vieille-femme.png" },
  { slug: "chat", fr: "chat", cluster: "animaux", ar: "قِطّ", audio: "/audio/chat.mp3", image: "/images/chat.png" },
  { slug: "chien", fr: "chien", cluster: "animaux", ar: "كَلْب", audio: "/audio/chien.mp3", image: "/images/chien.png" },
  { slug: "cheval", fr: "cheval", cluster: "animaux", ar: "حِصَان", audio: "/audio/cheval.mp3", image: "/images/cheval.png" },
  { slug: "oiseau", fr: "oiseau", cluster: "animaux", ar: "عُصْفُور", audio: "/audio/oiseau.mp3", image: "/images/oiseau.png" },
  { slug: "mouton", fr: "mouton", cluster: "animaux", ar: "خَرُوف", audio: "/audio/mouton.mp3", image: "/images/mouton.png" },
  { slug: "vache", fr: "vache", cluster: "animaux", ar: "بَقَرَة", audio: "/audio/vache.mp3", image: "/images/vache.png" },
  { slug: "lion", fr: "lion", cluster: "animaux", ar: "أَسَد", audio: "/audio/lion.mp3", image: "/images/lion.png" },
  { slug: "chameau", fr: "chameau", cluster: "animaux", ar: "جَمَل", audio: "/audio/chameau.mp3", image: "/images/chameau.png" },
  { slug: "ane", fr: "âne", cluster: "animaux", ar: "حِمَار", audio: "/audio/ane.mp3", image: "/images/ane.png" },
  { slug: "poule", fr: "poule", cluster: "animaux", ar: "دَجَاجَة", audio: "/audio/poule.mp3", image: "/images/poule.png" },
  { slug: "coq", fr: "coq", cluster: "animaux", ar: "دِيك", audio: "/audio/coq.mp3", image: "/images/coq.png" },
  { slug: "lapin", fr: "lapin", cluster: "animaux", ar: "أَرْنَب", audio: "/audio/lapin.mp3", image: "/images/lapin.png" },
  { slug: "souris", fr: "souris", cluster: "animaux", ar: "فَأْر", audio: "/audio/souris.mp3", image: "/images/souris.png" },
  { slug: "elephant", fr: "éléphant", cluster: "animaux", ar: "فِيل", audio: "/audio/elephant.mp3", image: "/images/elephant.png" },
  { slug: "serpent", fr: "serpent", cluster: "animaux", ar: "ثُعْبَان", audio: "/audio/serpent.mp3", image: "/images/serpent.png" },
  { slug: "tortue", fr: "tortue", cluster: "animaux", ar: "سُلَحْفَاة", audio: "/audio/tortue.mp3", image: "/images/tortue.png" },
  { slug: "canard", fr: "canard", cluster: "animaux", ar: "بَطَّة", audio: "/audio/canard.mp3", image: "/images/canard.png" },
  { slug: "abeille", fr: "abeille", cluster: "animaux", ar: "نَحْلَة", audio: "/audio/abeille.mp3", image: "/images/abeille.png" },
  { slug: "rouge", fr: "rouge", cluster: "couleurs", ar: "أَحْمَر", audio: "/audio/rouge.mp3", hex: "#D64541" },
  { slug: "bleu", fr: "bleu", cluster: "couleurs", ar: "أَزْرَق", audio: "/audio/bleu.mp3", hex: "#2F6BB0" },
  { slug: "vert", fr: "vert", cluster: "couleurs", ar: "أَخْضَر", audio: "/audio/vert.mp3", hex: "#4A8C5A" },
  { slug: "jaune", fr: "jaune", cluster: "couleurs", ar: "أَصْفَر", audio: "/audio/jaune.mp3", hex: "#E8C23A" },
  { slug: "noir", fr: "noir", cluster: "couleurs", ar: "أَسْوَد", audio: "/audio/noir.mp3", hex: "#1A1816" },
  { slug: "blanc", fr: "blanc", cluster: "couleurs", ar: "أَبْيَض", audio: "/audio/blanc.mp3", hex: "#FFFFFF" },
  { slug: "marron", fr: "marron", cluster: "couleurs", ar: "بُنِّيّ", audio: "/audio/marron.mp3", hex: "#8A5A33" },
  { slug: "orange", fr: "orange", cluster: "couleurs", ar: "بُرْتُقَالِيّ", audio: "/audio/orange.mp3", hex: "#E08A3C" },
  { slug: "rose", fr: "rose", cluster: "couleurs", ar: "وَرْدِيّ", audio: "/audio/rose.mp3", hex: "#E59AB0" },
  { slug: "gris", fr: "gris", cluster: "couleurs", ar: "رَمَادِيّ", audio: "/audio/gris.mp3", hex: "#9A9590" },
  { slug: "violet", fr: "violet", cluster: "couleurs", ar: "بَنَفْسَجِيّ", audio: "/audio/violet.mp3", hex: "#7E5AA2" },
  { slug: "dore", fr: "doré", cluster: "couleurs", ar: "ذَهَبِيّ", audio: "/audio/dore.mp3", hex: "#C19A4B" },
  { slug: "eau", fr: "eau", cluster: "manger", ar: "مَاء", audio: "/audio/eau.mp3", image: "/images/eau.png" },
  { slug: "pain", fr: "pain", cluster: "manger", ar: "خُبْز", audio: "/audio/pain.mp3", image: "/images/pain.png" },
  { slug: "lait", fr: "lait", cluster: "manger", ar: "لَبَن", audio: "/audio/lait.mp3", image: "/images/lait.png" },
  { slug: "the", fr: "thé", cluster: "manger", ar: "شَاي", audio: "/audio/the.mp3", image: "/images/the.png" },
  { slug: "cafe", fr: "café", cluster: "manger", ar: "قَهْوَة", audio: "/audio/cafe.mp3", image: "/images/cafe.png" },
  { slug: "fruit", fr: "fruit", cluster: "manger", ar: "فَاكِهَة", audio: "/audio/fruit.mp3", image: "/images/fruit.png" },
  { slug: "pomme", fr: "pomme", cluster: "manger", ar: "تُفَّاحَة", audio: "/audio/pomme.mp3", image: "/images/pomme.png" },
  { slug: "viande", fr: "viande", cluster: "manger", ar: "لَحْم", audio: "/audio/viande.mp3", image: "/images/viande.png" },
  { slug: "poisson", fr: "poisson", cluster: "manger", ar: "سَمَك", audio: "/audio/poisson.mp3", image: "/images/poisson.png" },
  { slug: "oeuf", fr: "œuf", cluster: "manger", ar: "بَيْضَة", audio: "/audio/oeuf.mp3", image: "/images/oeuf.png" },
  { slug: "banane", fr: "banane", cluster: "manger", ar: "مَوْز", audio: "/audio/banane.mp3", image: "/images/banane.png" },
  { slug: "raisin", fr: "raisin", cluster: "manger", ar: "عِنَب", audio: "/audio/raisin.mp3", image: "/images/raisin.png" },
  { slug: "datte", fr: "datte", cluster: "manger", ar: "تَمْر", audio: "/audio/datte.mp3", image: "/images/datte.png" },
  { slug: "riz", fr: "riz", cluster: "manger", ar: "رُزّ", audio: "/audio/riz.mp3", image: "/images/riz.png" },
  { slug: "fromage", fr: "fromage", cluster: "manger", ar: "جُبْن", audio: "/audio/fromage.mp3", image: "/images/fromage.png" },
  { slug: "miel", fr: "miel", cluster: "manger", ar: "عَسَل", audio: "/audio/miel.mp3", image: "/images/miel.png" },
  { slug: "tomate", fr: "tomate", cluster: "manger", ar: "طَمَاطِم", audio: "/audio/tomate.mp3", image: "/images/tomate.png" },
  { slug: "olive", fr: "olive", cluster: "manger", ar: "زَيْتُون", audio: "/audio/olive.mp3", image: "/images/olive.png" },
  { slug: "main", fr: "main", cluster: "corps", ar: "يَد", audio: "/audio/main.mp3", image: "/images/main.png" },
  { slug: "oeil", fr: "œil", cluster: "corps", ar: "عَيْن", audio: "/audio/oeil.mp3", image: "/images/oeil.png" },
  { slug: "bouche", fr: "bouche", cluster: "corps", ar: "فَم", audio: "/audio/bouche.mp3", image: "/images/bouche.png" },
  { slug: "nez", fr: "nez", cluster: "corps", ar: "أَنْف", audio: "/audio/nez.mp3", image: "/images/nez.png" },
  { slug: "oreille", fr: "oreille", cluster: "corps", ar: "أُذُن", audio: "/audio/oreille.mp3", image: "/images/oreille.png" },
  { slug: "pied", fr: "pied", cluster: "corps", ar: "قَدَم", audio: "/audio/pied.mp3", image: "/images/pied.png" },
  { slug: "coeur", fr: "cœur", cluster: "corps", ar: "قَلْب", audio: "/audio/coeur.mp3", image: "/images/coeur.png" },
  { slug: "cheveux", fr: "cheveux", cluster: "corps", ar: "شَعْر", audio: "/audio/cheveux.mp3", image: "/images/cheveux.png" },
  { slug: "dent", fr: "dent", cluster: "corps", ar: "سِنّ", audio: "/audio/dent.mp3", image: "/images/dent.png" },
  { slug: "bras", fr: "bras", cluster: "corps", ar: "ذِرَاع", audio: "/audio/bras.mp3", image: "/images/bras.png" },
  { slug: "jambe", fr: "jambe", cluster: "corps", ar: "سَاق", audio: "/audio/jambe.mp3", image: "/images/jambe.png" },
  { slug: "doigt", fr: "doigt", cluster: "corps", ar: "إِصْبَع", audio: "/audio/doigt.mp3", image: "/images/doigt.png" },
];

export const wordBySlug: Record<string, Word> =
  Object.fromEntries(WORDS.map((w) => [w.slug, w]));
