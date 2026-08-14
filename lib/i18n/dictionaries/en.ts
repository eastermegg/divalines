/**
 * English copy. This file is the reference dictionary: its shape defines
 * the `Dictionary` type every other locale must satisfy. Translatable
 * copy lives here; non-translatable config (URL, release date, playlist
 * id, social hrefs, brand name) stays in lib/site.ts.
 *
 * Asterisks mark the ONE Migra-accent word per phrase (rendered by
 * components/AccentText) — never a whole clause. `{token}` placeholders
 * are filled at render time via lib/i18n/context#fill.
 */

const MANIFESTO_PHRASE =
  "She doesn't wait To Be Chosen. she chooses *herself*. " +
  "She Doesn't Follow The Rhythm. she is the *rhythm*. " +
  "Soft. Don't Mistake It For Weakness. " +
  "You Don't Become Her. you remember you are *her*.";

export const en = {
  site: {
    title: "Diva Lines — Independ Heels Dancewear. Join the waitlist",
    description:
      "Independ heels dancewear, designed in Paris. Heels engineered for the floor, cut for the body. First drop this fall — limited run, waitlist first.",
    brandLine: ["Independ Heels Dancewear Brand", "Designed in Paris"] as [
      string,
      string,
    ],
  },

  hero: {
    hook: ["You'll Feel Her.", "Before You See Her.", "Period."],
    paragraph:
      "Heels engineered for the floor, cut for the body. First drop this fall — limited run, waitlist first.",
    sr: "Diva Lines — independ heels dancewear, designed in Paris",
  },

  manifesto: `${MANIFESTO_PHRASE} ${MANIFESTO_PHRASE}`,
  manifestoLabel: "the manifesto",

  collection: {
    label: "The first line — fall 2026",
    title: "five pieces. cut for the *floor*.",
    sub: "Sketched until the drop. The waitlist sees them shot first.",
    hint: "drag to spin",
    revealed: "— revealed at the drop",
    items: [
      {
        n: "N°01",
        name: "the bodysuit",
        details: [
          ["cut", "open back"],
          ["fabric", "second-skin jersey"],
          ["stretch", "four-way"],
        ],
      },
      {
        n: "N°02",
        name: "the wrap skirt",
        details: [
          ["cut", "high slit"],
          ["fabric", "matte crêpe"],
          ["length", "midi"],
        ],
      },
      {
        n: "N°03",
        name: "the second skin",
        details: [
          ["cut", "full sleeve"],
          ["fabric", "power mesh"],
          ["stretch", "four-way"],
        ],
      },
      {
        n: "N°04",
        name: "the flare pant",
        details: [
          ["cut", "high rise"],
          ["fabric", "liquid knit"],
          ["length", "full flare"],
        ],
      },
      {
        n: "N°05",
        name: "the crop top",
        details: [
          ["cut", "boxy"],
          ["fabric", "ribbed jersey"],
          ["stretch", "two-way"],
        ],
      },
    ],
  },

  aura: {
    label: "The aura quiz — with the first drop",
    title: "you've felt her. now *see* her.",
    sub:
      "Five energies, read as a spectrum — your own mix, in your own proportions. " +
      "Out of it comes your diva profile: an aura in your colours, and the numbers to prove it.",
    energies: [
      ["L'Onde", 42],
      ["Le Murmure", 24],
      ["La Braise", 18],
      ["Le Vertige", 10],
      ["L'Éclat", 6],
    ] as [string, number][],
    hint: "move — she follows",
    cta: "Join the waitlist. read her first.",
    sampleMix: "Sample aura mix",
  },

  form: {
    placeholder: "Enter your email",
    cta: "Join the waitlist",
    success: "You're on the list. ✦",
    errorInvalid: "That email doesn't look right — try again.",
    errorServer: "Something slipped. Try again in a moment.",
    errorRateLimited: "Easy — too many tries. Give it a few minutes.",
    consent: "By joining you agree to receive launch updates.",
    proofBefore: "Already",
    proof: "on the list ✦",
  },

  countdown: {
    label: "Time before release",
    launching: "Launching {date}.",
  },

  header: {
    topAria: "Diva Lines — top",
  },

  footer: {
    joinLine: "join the *first* line.",
    socialLegalAria: "Social and legal",
    privacy: "Privacy policy",
    legal: "Legal notice",
    rights: "All rights reserved.",
  },

  waitlist: {
    emailLabel: "Email address",
    sending: "Sending",
    privacy: "Privacy policy",
  },

  vinyl: {
    play: "Play the Diva Lines playlist",
    pause: "Pause the playlist",
    show: "Show the playlist",
    collapse: "Collapse the player — music keeps playing",
    panelTitle: "diva lines playlist",
    nowPlaying: "playing",
    handle: "playlist",
  },

  look: {
    turntableAngle: "Turntable angle",
    prev: "Previous look — {name}",
    next: "Next look — {name}",
    srCount: "look {n} of {total}: {name}",
  },

  line: {
    sectionAria: "The first line — fall 2026",
    controls: "scroll · drag · arrows",
    plates: [
      { name: "the bodysuit", alt: "The bodysuit, open back" },
      { name: "the wrap", alt: "The wrap top, tied front" },
      { name: "the halter", alt: "The halter top" },
    ],
  },

  marquee:
    "you'll feel her before you see her ✦ diva lines ✦ first drop this fall ✦ limited run ✦ ",

  tagline: {
    line1: "Heels *dancewear* brand",
    line2: "made for dancers by dancers, for *movement*",
  },

  portraitAlt: {
    heatCam: "Dancer portrait, heat-cam treatment",
    neonWaves: "Dancer portrait, neon waves",
    danceFloor: "Dance floor, heat horizon",
  },

  variantSwitcher: {
    aria: "Design versions",
  },

  languageSwitcher: {
    aria: "Language",
    fr: "FR",
    en: "EN",
  },

  privacy: {
    back: "Diva Lines",
    title: "Privacy policy",
    collect: {
      h: "What we collect",
      p: "When you join the waitlist we store your email address, the date of signup, your browser language, optional campaign parameters (UTM), and a salted hash of your IP address used only for abuse prevention. Your raw IP address is never stored.",
    },
    why: {
      h: "Why we collect it",
      p: "Solely to send you updates about the {name} launch. Legal basis: your explicit consent, given when you submit the form. No advertising, no profiling, no sale of data. Ever.",
    },
    where: {
      h: "Where it lives",
      p: "Data is stored with our processors Supabase (database, EU-hosted project) and mirrored to Notion for the team's consultation. Both act under data-processing agreements.",
    },
    howLong: {
      h: "How long we keep it",
      p: "Until 24 months after the brand launch, or until you unsubscribe — whichever comes first. Every email we send includes an unsubscribe link.",
    },
    rights: {
      h: "Your rights",
      before:
        "Under the GDPR you can access, rectify, export or erase your data, and withdraw consent at any time. Write to ",
      after:
        " — we answer within 30 days. You may also lodge a complaint with the CNIL (cnil.fr).",
    },
    cookies: {
      h: "Cookies",
      p: "This site sets no tracking cookies. A single sessionStorage flag remembers whether you've seen the intro animation; it never leaves your browser.",
    },
    legal: {
      h: "Legal notice",
      body: "Publication director and hosting details will be completed before commercial launch. Contact:",
    },
  },
};

export type Dictionary = typeof en;

