import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * French copy — the brand's native voice (lowercase italic, intimate
 * "tu"). Mirrors the shape of the English reference dictionary; the
 * Migra-accent word per phrase (*asterisks*) and `{token}` placeholders
 * sit in the same places.
 */

const MANIFESTO_PHRASE =
  "Elle n'attend pas qu'on la choisisse. elle se choisit *elle-même*. " +
  "Elle ne suit pas le rythme. elle est le *rythme*. " +
  "Douce. N'y vois pas une *faiblesse*. " +
  "Tu ne deviens pas elle. tu te souviens que tu es *elle*.";

export const fr: Dictionary = {
  site: {
    title:
      "Diva Lines — Vêtements de danse en talons, indépendants. Rejoignez la liste d'attente",
    description:
      "Vêtements de danse en talons, indépendants, conçus à Paris. Des talons pensés pour le sol, des coupes pensées pour le corps. Première collection cet automne — série limitée, la liste d'attente d'abord.",
    brandLine: ["Marque indépendante de danse en talons", "Conçu à Paris"],
  },

  hero: {
    hook: ["Tu la sentiras.", "Avant de la voir.", "Point final."],
    paragraph:
      "Des talons pensés pour le sol, des coupes pensées pour le corps. Première collection cet automne — série limitée, la liste d'attente d'abord.",
    sr: "Diva Lines — vêtements de danse en talons, indépendants, conçus à Paris",
  },

  manifesto: `${MANIFESTO_PHRASE} ${MANIFESTO_PHRASE}`,
  manifestoLabel: "le manifeste",

  collection: {
    label: "La première ligne — automne 2026",
    title: "cinq pièces. taillées pour le *sol*.",
    sub: "Esquissées jusqu'au lancement. La liste d'attente les découvre en photo d'abord.",
    hint: "glisse pour tourner",
    revealed: "— dévoilé au lancement",
    items: [
      {
        n: "N°01",
        name: "le body",
        details: [
          ["coupe", "dos ouvert"],
          ["tissu", "jersey seconde peau"],
          ["extensibilité", "4 sens"],
        ],
      },
      {
        n: "N°02",
        name: "la jupe portefeuille",
        details: [
          ["coupe", "fente haute"],
          ["tissu", "crêpe mat"],
          ["longueur", "midi"],
        ],
      },
      {
        n: "N°03",
        name: "la seconde peau",
        details: [
          ["coupe", "manches longues"],
          ["tissu", "résille gainante"],
          ["extensibilité", "4 sens"],
        ],
      },
      {
        n: "N°04",
        name: "le pantalon évasé",
        details: [
          ["coupe", "taille haute"],
          ["tissu", "maille fluide"],
          ["longueur", "grand évasé"],
        ],
      },
      {
        n: "N°05",
        name: "le crop top",
        details: [
          ["coupe", "carrée"],
          ["tissu", "jersey côtelé"],
          ["extensibilité", "2 sens"],
        ],
      },
    ],
  },

  aura: {
    label: "Le quiz d'aura — avec la première collection",
    title: "tu l'as sentie. maintenant, *vois*-la.",
    sub:
      "Cinq énergies, lues comme un spectre — ton propre mélange, dans tes propres proportions. " +
      "Il en ressort ton profil de diva : une aura à tes couleurs, et les chiffres pour le prouver.",
    energies: [
      ["L'Onde", 42],
      ["Le Murmure", 24],
      ["La Braise", 18],
      ["Le Vertige", 10],
      ["L'Éclat", 6],
    ],
    hint: "bouge — elle suit",
    cta: "Rejoins la liste d'attente. lis-la en avant-première.",
    sampleMix: "Exemple de mélange d'aura",
  },

  form: {
    placeholder: "Entre ton adresse e-mail",
    cta: "Rejoindre la liste d'attente",
    success: "Tu es sur la liste. ✦",
    errorInvalid: "Cet e-mail semble incorrect — réessaie.",
    errorServer: "Un souci est survenu. Réessaie dans un instant.",
    errorRateLimited: "Doucement — trop d'essais. Patiente quelques minutes.",
    consent: "En rejoignant, tu acceptes de recevoir des nouvelles du lancement.",
    proofBefore: "Déjà",
    proof: "sur la liste ✦",
  },

  countdown: {
    label: "Temps avant la sortie",
    launching: "Sortie le {date}.",
  },

  header: {
    topAria: "Diva Lines — haut",
  },

  footer: {
    joinLine: "rejoins la *première* ligne.",
    socialLegalAria: "Réseaux sociaux et mentions légales",
    privacy: "Politique de confidentialité",
    legal: "Mentions légales",
    rights: "Tous droits réservés.",
  },

  waitlist: {
    emailLabel: "Adresse e-mail",
    sending: "Envoi en cours",
    privacy: "Politique de confidentialité",
  },

  vinyl: {
    play: "Écouter la playlist Diva Lines",
    pause: "Mettre la playlist en pause",
    show: "Afficher la playlist",
    collapse: "Réduire le lecteur — la musique continue",
    panelTitle: "playlist diva lines",
    nowPlaying: "en lecture",
    handle: "playlist",
  },

  look: {
    turntableAngle: "Angle du plateau",
    prev: "Look précédent — {name}",
    next: "Look suivant — {name}",
    srCount: "look {n} sur {total} : {name}",
  },

  line: {
    sectionAria: "La première ligne — automne 2026",
    controls: "défile · glisse · flèches",
    plates: [
      { name: "le body", alt: "Le body, dos ouvert" },
      { name: "le cache-cœur", alt: "Le cache-cœur, noué devant" },
      { name: "le dos-nu", alt: "Le haut dos-nu" },
    ],
  },

  marquee:
    "tu la sentiras avant de la voir ✦ diva lines ✦ première collection cet automne ✦ série limitée ✦ ",

  tagline: {
    line1: "Marque de vêtements de *danse* en talons",
    line2: "faite par des danseuses pour des danseuses, pour le *mouvement*",
  },

  portraitAlt: {
    heatCam: "Portrait de danseuse, traitement caméra thermique",
    neonWaves: "Portrait de danseuse, ondes néon",
    danceFloor: "Piste de danse, horizon incandescent",
  },

  variantSwitcher: {
    aria: "Versions du design",
  },

  languageSwitcher: {
    aria: "Langue",
    fr: "FR",
    en: "EN",
  },

  privacy: {
    back: "Diva Lines",
    title: "Politique de confidentialité",
    collect: {
      h: "Ce que nous collectons",
      p: "Lorsque tu rejoins la liste d'attente, nous conservons ton adresse e-mail, la date d'inscription, la langue de ton navigateur, d'éventuels paramètres de campagne (UTM) et une empreinte salée de ton adresse IP, utilisée uniquement pour prévenir les abus. Ton adresse IP brute n'est jamais stockée.",
    },
    why: {
      h: "Pourquoi nous les collectons",
      p: "Uniquement pour t'envoyer des nouvelles du lancement de {name}. Base légale : ton consentement explicite, donné lorsque tu soumets le formulaire. Aucune publicité, aucun profilage, aucune revente de données. Jamais.",
    },
    where: {
      h: "Où elles sont hébergées",
      p: "Les données sont conservées chez nos sous-traitants Supabase (base de données, projet hébergé dans l'UE) et répliquées vers Notion pour la consultation de l'équipe. Les deux agissent dans le cadre d'accords de traitement des données.",
    },
    howLong: {
      h: "Combien de temps nous les conservons",
      p: "Jusqu'à 24 mois après le lancement de la marque, ou jusqu'à ta désinscription — selon la première échéance. Chaque e-mail que nous envoyons contient un lien de désinscription.",
    },
    rights: {
      h: "Tes droits",
      before:
        "En vertu du RGPD, tu peux accéder à tes données, les rectifier, les exporter ou les effacer, et retirer ton consentement à tout moment. Écris à ",
      after:
        " — nous répondons sous 30 jours. Tu peux aussi introduire une réclamation auprès de la CNIL (cnil.fr).",
    },
    cookies: {
      h: "Cookies",
      p: "Ce site ne dépose aucun cookie de suivi. Un unique indicateur en sessionStorage retient si tu as déjà vu l'animation d'introduction ; il ne quitte jamais ton navigateur.",
    },
    legal: {
      h: "Mentions légales",
      body: "Le directeur de la publication et les informations d'hébergement seront complétés avant le lancement commercial. Contact :",
    },
  },
};
