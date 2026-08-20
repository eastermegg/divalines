import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * French copy — the brand's native voice (lowercase italic, intimate
 * "tu"). Mirrors the shape of the English reference dictionary; the
 * Migra-accent word per phrase (*asterisks*) and `{token}` placeholders
 * sit in the same places.
 */

// The manifesto in its three scroll acts — the overheard reproaches, the
// answer, the tagline. *asterisks* mark the Migra accent words. `manifesto`
// keeps a flat, flowing copy for a11y / the other variants.
// *asterisks* mark the ONE Migra-accent word (quotes + tagline render
// mixed-face via AccentText). [[double brackets]] mark the body's colour
// highlights — whole punches that flash in on reveal.
const MANIFESTO_QUOTES = [
  "Arrête de faire ta *diva*.",
  "Elle se prend pour *qui*.",
  "Elle est *compliquée*, celle-là.",
  "Faut pas la *contrarier*, c'est une diva.",
];
const MANIFESTO_BODY =
  "[[Diva]]. On nous l'a toutes dit. La capricieuse. L'excessive. Celle qui s'y croit. [[Trop.]] " +
  "Et pour le heels, le même procès. Comme si un corps qui bouge devait forcément s'adresser à quelqu'un. Tu comptes le montrer à qui. [[À personne.]] C'est pour nous. Pour les trois secondes où le compte s'arrête et où plus rien ne pense. " +
  "Chez Divalines, nous gardons le mot. Nous jetons le reproche. Une diva, c'est une femme [[entière]]. Douce et puissante. Vulnérable et souveraine. Les deux en même temps. Elle prend sa place, sans s'excuser. Elle arrive, et la salle le sait. [[On la sent avant de la voir.]] " +
  "Ça ne se décide pas devant le miroir. Ça se sent à l'intérieur. C'est la seconde avant le premier compte. C'est la tête qui se relève et qui ne redescend plus. " +
  "Diva n'est pas un défaut. C'est [[un état d'esprit]]. Nous ne fabriquons pas des divas. Nous habillons celles qui le sont déjà.";
const MANIFESTO_TAGLINE = "be the *diva* you already are.";
const MANIFESTO_TEXT = [
  MANIFESTO_QUOTES.map((q) => `« ${q} »`).join(" "),
  MANIFESTO_BODY,
  MANIFESTO_TAGLINE,
]
  .join(" ")
  .replace(/\[\[|\]\]/g, ""); // flat a11y copy carries no highlight markers

export const fr: Dictionary = {
  site: {
    title:
      "Divalines · Dancewear indépendant pour les heels. Rejoins la liste d'attente",
    description:
      "Dancewear indépendant pour les heels, conçu à Paris. Des vêtements techniques qui suivent chaque mouvement. Première collection cet automne.",
    brandLine: ["Marque de dancewear indépendante pour danseur.euse.s heels", "Conçue à Paris"],
  },

  hero: {
    hook: ["Te sentir puissante.", "L'assumer.", "Simplement."],
    paragraph:
      "Des vêtements techniques pensés pour les danseur.euse.s heels, qui suivent chaque mouvement. Première collection cet automne.",
    sr: "Divalines, marque de dancewear indépendante pour danseur.euse.s heels, conçue à Paris",
  },

  manifesto: MANIFESTO_TEXT,
  manifestoParts: {
    quotes: MANIFESTO_QUOTES,
    body: MANIFESTO_BODY,
    tagline: MANIFESTO_TAGLINE,
  },
  manifestoLabel: "le manifeste",

  collection: {
    label: "La première ligne · Automne 2026",
    title: "Quatre pièces. Taillées pour le *studio*.",
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

  form: {
    placeholder: "Entre ton adresse e-mail",
    cta: "Je m'inscris",
    success: "Tu es sur la liste. ✦",
    errorInvalid: "Cet e-mail semble incorrect, réessaie.",
    errorServer: "Un souci est survenu. Réessaie dans un instant.",
    errorRateLimited: "Doucement : trop d'essais. Patiente quelques minutes.",
    crowd: "la ligne se remplit ✦",
  },

  referral: {
    seeMyRank: "Voir mon classement",
    myLink: "Mon lien de parrainage",
    onList: "Tu es sur la liste 🖤",
    panelTitle: "Tu es bien *inscrite*.",
    panelTitleNamed: "{name}, tu es bien *inscrite*.",
    sharePitch: "Top 5 : −10%. Top {top} : accès 24h avant.",
    stakes:
      "Tente ta chance et rejoins la waitlist : Top 5 : −10%. Top {top} : accès 24h avant.",
    shareLine: "Plus tes copines rejoignent via ton lien, plus tu gagnes des places.",
    rankLine: "Ta place : {rank} sur {total}.",
    referralsLine: "{n} inscrites grâce à ton lien ✦",
    linkLabel: "Ton lien",
    copy: "Copier le lien",
    copied: "Lien copié ✦",
    story: "Story Instagram",
    storyToast:
      "Visuel téléchargé + lien copié. Colle-le en sticker lien sur ta story",
    storyFallback:
      "Appui long sur l'image pour l'enregistrer. Ton lien est déjà copié",
    whatsapp: "Partager sur WhatsApp",
    share: "Partager",
    shareText:
      "La marque de dancewear heels dont je t'ai parlé ouvre sa waiting list pour le premier drop ✦ inscris-toi avec mon lien et invite ton gang aussi - les premières ont -10% et l'accès 24h avant",
    rule: "La première collection est limitée. Inscris-toi, fais entrer les divas de ton gang, monte dans la liste. Top 5 : −10%. Top {top} : accès 24h avant.",
    notYou: "Pas toi ?",
    close: "Fermer",
    storyTitle: "j'ai pris ma place pour le premier drop",
    storySticker: "rejoins et tente de gagner −10% et l'accès 24h avant",
    storyLinkSlot: "colle ton lien ici ✦",
    storyOf: "sur {total}",
    closedTitle: "Les inscriptions sont *closes*.",
    closedBody: "Les inscriptions sont closes. Ta place reste consultable ici.",
    reassure: "Gratuit, zéro spam.",
    urgency: "La liste vient d'ouvrir ✦",
    closedFinal: "Ta place finale : {rank}.",
    followCta: "Suivre le compte",
  },

  leaderboard: {
    metaTitle: "Entre 24h avant tout le monde",
    pitch1: "Top 5 : −10% sur la première collection. Top {top} : accès 24h avant.",
    title: ["Inscris-toi.", "Partage à tes divas.", "Monte, *gagne*."],
    steps: [
      "Inscris-toi : ta place + ton lien",
      "Top 10 : accès 24h avant",
      "Top 5 : −10%",
    ],
    listAria: "Top 10 de la liste d'attente",
    refsOne: "1 diva",
    refsMany: "{n} divas",
    you: "toi ✦",
    empty: "Personne encore. La ligne commence avec toi.",
    joinTitle: "À ton tour : rejoins la *waitlist*.",
    boardTitle: "Le top 10",
    live: "en direct",
    loadMore: "Voir plus",
  },

  countdown: {
    label: "Avant la première collection",
    launching: "Première collection le {date}.",
  },

  header: {
    topAria: "Divalines, haut de page",
    board: "Ramène tes divas, gagne des places",
    menu: "Menu",
    close: "Fermer",
    navAria: "Navigation principale",
    nav: {
      manifesto: "Manifeste",
      collection: "Collection",
      join: "Rejoins la liste d'attente (−10% à la clé !)",
    },
  },

  // Marquee des lots — le bandeau sticky au-dessus du header. Fragments
  // courts en minuscules ; le bandeau les boucle avec des ✦ et pointe
  // vers le classement, donc chaque item doit se lire seul.
  banner: {
    aria: "Top {top} : 24h d'avance. Top 5 : −10%. Ramène tes divas, passe devant.",
    items: [
      "Top {top} : 24h d'avance",
      "Top 5 : −10%",
      "Ramène tes divas, passe devant",
    ],
  },

  footer: {
    joinLine: "La première *collection* arrive.",
    socialLegalAria: "Réseaux sociaux et mentions légales",
    privacy: "Politique de confidentialité",
    legal: "Mentions légales",
  },

  waitlist: {
    emailLabel: "Adresse e-mail",
    sending: "Envoi en cours",
    privacy: "Politique de confidentialité",
  },

  vinyl: {
    play: "Écouter la playlist Divalines",
    pause: "Mettre la playlist en pause",
    show: "Afficher la playlist",
    collapse: "Réduire le lecteur, la musique continue",
    panelTitle: "playlist diva lines",
    nowPlaying: "en lecture",
    handle: "playlist",
  },

  line: {
    sectionAria: "La première ligne · automne 2026",
    plates: [
      { name: "joséphine", alt: "Le body, dos ouvert" },
      { name: "grace", alt: "Le cache-cœur, noué devant" },
      { name: "tina", alt: "Le haut dos-nu" },
    ],
  },

  tagline: {
    line1: "dancewear indépendant pour les *heels*",
    line2: "faite par des danseuses pour des danseuses, pour le *mouvement*",
  },

  languageSwitcher: {
    aria: "Langue",
    fr: "FR",
    en: "EN",
  },

  privacy: {
    back: "Divalines",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : [À COMPLÉTER, ex. 15 août 2026].",
    intro:
      "Cette politique explique comment {name} collecte et traite tes données personnelles lorsque tu rejoins la liste d'attente, conformément au Règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.",
    controller: {
      h: "Responsable du traitement",
      before:
        "Le responsable du traitement est [À COMPLÉTER : dénomination sociale], [forme juridique] au capital de [montant] €, immatriculée au RCS de [ville] sous le numéro [SIREN/SIRET], dont le siège social est situé [adresse complète]. Pour toute question relative à tes données, écris à ",
      after: ".",
    },
    collect: {
      h: "Ce que nous collectons",
      p: "Lorsque tu rejoins la liste d'attente, nous conservons ton adresse e-mail, la date d'inscription, la langue de ton navigateur, d'éventuels paramètres de campagne (UTM) et une empreinte salée de ton adresse IP, utilisée uniquement pour prévenir les abus. Ton adresse IP brute n'est jamais stockée. Si tu participes au parrainage, nous conservons aussi le code de la personne qui t'a invitée et, si tu le renseignes (c'est optionnel), ton identifiant Instagram, utilisé uniquement pour te contacter en message privé si tu gagnes. Un nom de scène généré (par exemple « Diva Stella Elektra ») t'est attribué : c'est lui, et jamais ton e-mail ni ton identifiant Instagram, qui apparaît sur le classement public.",
    },
    why: {
      h: "Pourquoi nous les collectons",
      p: "Uniquement pour t'envoyer des nouvelles du lancement de {name}. Base légale : ton consentement explicite (article 6.1.a du RGPD), donné lorsque tu soumets le formulaire. Aucune publicité tierce, aucun profilage, aucune revente de données. Jamais.",
    },
    where: {
      h: "Où elles sont hébergées",
      p: "Les données sont conservées chez nos sous-traitants Supabase (base de données, projet hébergé dans l'UE) et répliquées vers Notion pour la consultation de l'équipe. Les deux agissent dans le cadre d'accords de traitement des données (DPA).",
    },
    transfers: {
      h: "Transferts hors de l'Union européenne",
      p: "Certaines de tes données sont répliquées vers Notion Labs, Inc., situé aux États-Unis. Ce transfert hors de l'UE est encadré par les clauses contractuelles types adoptées par la Commission européenne, garantissant un niveau de protection équivalent. La base de données Supabase, elle, est hébergée sur des serveurs situés dans l'Union européenne.",
    },
    howLong: {
      h: "Combien de temps nous les conservons",
      p: "Jusqu'à 24 mois après le lancement de la marque, ou jusqu'à ta désinscription, selon la première échéance. Chaque e-mail que nous envoyons contient un lien de désinscription.",
    },
    rights: {
      h: "Tes droits",
      before:
        "En vertu du RGPD, tu disposes d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de tes données, et tu peux retirer ton consentement à tout moment sans que cela n'affecte la licéité du traitement effectué auparavant. Pour exercer ces droits, écris à ",
      after:
        ". Nous répondons sous 30 jours. Tu peux aussi introduire une réclamation auprès de la CNIL (cnil.fr).",
    },
    cookies: {
      h: "Cookies",
      p: "Ce site ne dépose aucun cookie de suivi ni de mesure d'audience. Un unique indicateur en sessionStorage retient si tu as déjà vu l'animation d'introduction ; il ne quitte jamais ton navigateur et aucun consentement préalable n'est requis.",
    },
    legal: {
      h: "Mentions légales",
      editorH: "Éditeur du site",
      editorBefore:
        "[À COMPLÉTER : dénomination sociale], [forme juridique] au capital de [montant] € · RCS/SIRET [numéro] · TVA intracommunautaire [numéro] · siège social : [adresse complète]. Directeur de la publication : [À COMPLÉTER : nom]. Contact : ",
      editorAfter: ".",
      hostH: "Hébergeur",
      hostBody:
        "Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis (vercel.com). [À confirmer selon l'hébergeur retenu.]",
      ipH: "Propriété intellectuelle",
      ipBody:
        "L'ensemble des contenus de ce site (marque, logotype, textes, visuels, création graphique et code) est la propriété exclusive de [À COMPLÉTER : dénomination sociale] ou de ses partenaires. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite.",
    },
  },
};
