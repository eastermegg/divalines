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

// The manifesto in its three scroll acts — the overheard reproaches, the
// answer, the tagline. *asterisks* mark the Migra accent words. `manifesto`
// keeps a flat, flowing copy for a11y / the other variants.
// *asterisks* mark the ONE Migra-accent word (the quotes + tagline are
// rendered mixed-face via AccentText). [[double brackets]] mark the body's
// colour highlights — whole punches that flash in on reveal.
const MANIFESTO_QUOTES = [
  "Stop being such a *diva*.",
  "Who does she think she *is*.",
  "She's a *difficult* one, that girl.",
  "Don't *upset* her, she's a diva.",
];
const MANIFESTO_BODY =
  "[[Diva]]. We've all been called it. The demanding one. The dramatic one. The one who thinks she's something. [[Too much.]] " +
  "And for heels, the same trial. As if a body in motion had to be addressing someone. Who are you doing this for. [[No one.]] It's for us. For the three seconds when the count drops away and nothing thinks. " +
  "At Divalines, we keep the word. We drop the reproach. A diva is a whole [[woman]]. Soft and powerful. Vulnerable and sovereign. Both at once. She takes her space, without apologising. She walks in, and the room knows. [[You feel her before you see her.]] " +
  "It isn't decided in the mirror. It's felt inside. It's the second before the first count. It's the head that lifts and doesn't come back down. " +
  "Diva isn't a flaw. It's [[a state of mind]]. We don't make divas. We dress the ones who already are.";
const MANIFESTO_TAGLINE = "be the *diva* you already are.";
const MANIFESTO_TEXT = [
  MANIFESTO_QUOTES.map((q) => `« ${q} »`).join(" "),
  MANIFESTO_BODY,
  MANIFESTO_TAGLINE,
]
  .join(" ")
  .replace(/\[\[|\]\]/g, ""); // flat a11y copy carries no highlight markers

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

  manifesto: MANIFESTO_TEXT,
  manifestoParts: {
    quotes: MANIFESTO_QUOTES,
    body: MANIFESTO_BODY,
    tagline: MANIFESTO_TAGLINE,
  },
  manifestoLabel: "the manifesto",

  collection: {
    label: "The first line — fall 2026",
    title: "four pieces. cut for the *floor*.",
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

  referral: {
    instaPlaceholder: "@yourhandle",
    alreadyHint: "already on the list? enter your email to see your rank",
    panelTitle: "you're on the *list*.",
    rankLine: "You're {rank} of {total}",
    topTenLine: "You're in the top 10 🖤 hold your place",
    toTopOne: "One more referral and you're in the top 10",
    toTopMany: "{n} more referrals to crack the top 10",
    referralsLine: "{n} joined through your link ✦",
    linkLabel: "your referral link",
    copy: "Copy the link",
    copied: "Link copied ✦",
    story: "Instagram story",
    storyToast:
      "Visual downloaded + link copied — paste it as a link sticker on your story",
    storyFallback:
      "long-press the image to save it — your link is already copied",
    whatsapp: "Share on WhatsApp",
    whatsappText: "Join me on the Divalines waitlist 🖤 {link}",
    rule: "Bring your girls up the list — the first 10 get the drop 24h before everyone else.",
    notYou: "not you?",
    close: "Close",
    stageLabel: "on the ranking:",
    seeBoard: "see the full ranking",
    instaAsk: "your insta — so we can DM you if you win 🖤",
    instaSaveCta: "Save",
    instaSaved: "saved 🖤",
    storyTitle: "i'm on the list",
    storyOf: "of {total}",
    closedTitle: "the ranking is *closed*.",
    closedBody: "Signups are frozen — your ranking stays right here.",
    loading: "checking your rank…",
  },

  leaderboard: {
    metaTitle: "The ranking",
    eyebrow: "the waitlist game",
    title: "the *ranking*.",
    privacyNote: "Stage names only — emails never appear here.",
    listAria: "Waitlist ranking",
    count: "{n} on the list",
    refsOne: "1 referral",
    refsMany: "{n} referrals",
    you: "you ✦",
    empty: "no one yet — the line starts with you.",
    joinTitle: "your turn — join the *line*.",
  },

  countdown: {
    label: "Time before release",
    launching: "Launching {date}.",
  },

  header: {
    topAria: "Diva Lines — top",
  },

  footer: {
    eyebrow: "fall 2026 — limited run",
    joinLine: "join the *first* line.",
    sub: "the waitlist sees her before anyone else — and the line is short.",
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

  line: {
    sectionAria: "The first line — fall 2026",
    controls: "scroll · drag · arrows",
    plates: [
      { name: "joséphine", alt: "The bodysuit, open back" },
      { name: "grace", alt: "The wrap top, tied front" },
      { name: "tina", alt: "The halter top" },
    ],
  },

  tagline: {
    line1: "Heels *dancewear* brand",
    line2: "made for dancers by dancers, for *movement*",
  },

  languageSwitcher: {
    aria: "Language",
    fr: "FR",
    en: "EN",
  },

  privacy: {
    back: "Diva Lines",
    title: "Privacy policy",
    updated: "Last updated: [TO COMPLETE — e.g. 15 August 2026].",
    intro:
      "This policy explains how {name} collects and processes your personal data when you join the waitlist, in accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act.",
    controller: {
      h: "Data controller",
      before:
        "The data controller is [TO COMPLETE — legal name], a [legal form] with share capital of €[amount], registered with the [city] Trade and Companies Register under number [company no.], with registered office at [full address]. For any question about your data, write to ",
      after: ".",
    },
    collect: {
      h: "What we collect",
      p: "When you join the waitlist we store your email address, the date of signup, your browser language, optional campaign parameters (UTM), and a salted hash of your IP address used only for abuse prevention. Your raw IP address is never stored. If you take part in the referral game we also store the code of the person who invited you and, if you provide it (it's optional), your Instagram handle — used solely to DM you if you win. A generated stage name (e.g. \"diva solaire\") is assigned to you: that name, and never your email or Instagram handle, is what appears on the public leaderboard.",
    },
    why: {
      h: "Why we collect it",
      p: "Solely to send you updates about the {name} launch. Legal basis: your explicit consent (GDPR Article 6(1)(a)), given when you submit the form. No third-party advertising, no profiling, no sale of data. Ever.",
    },
    where: {
      h: "Where it lives",
      p: "Data is stored with our processors Supabase (database, EU-hosted project) and mirrored to Notion for the team's consultation. Both act under data-processing agreements (DPAs).",
    },
    transfers: {
      h: "Transfers outside the European Union",
      p: "Some of your data is mirrored to Notion Labs, Inc., located in the United States. This transfer outside the EU is governed by the Standard Contractual Clauses adopted by the European Commission, ensuring an equivalent level of protection. The Supabase database itself is hosted on servers located within the European Union.",
    },
    howLong: {
      h: "How long we keep it",
      p: "Until 24 months after the brand launch, or until you unsubscribe — whichever comes first. Every email we send includes an unsubscribe link.",
    },
    rights: {
      h: "Your rights",
      before:
        "Under the GDPR you have the right to access, rectify, erase, restrict, object to and port your data, and to withdraw consent at any time without affecting the lawfulness of processing carried out beforehand. To exercise these rights, write to ",
      after:
        " — we answer within 30 days. You may also lodge a complaint with the CNIL (cnil.fr).",
    },
    cookies: {
      h: "Cookies",
      p: "This site sets no tracking or analytics cookies. A single sessionStorage flag remembers whether you've seen the intro animation; it never leaves your browser and requires no prior consent.",
    },
    legal: {
      h: "Legal notice",
      editorH: "Site publisher",
      editorBefore:
        "[TO COMPLETE — legal name], a [legal form] with share capital of €[amount] — company no. [number] — VAT [number] — registered office: [full address]. Publication director: [TO COMPLETE — name]. Contact: ",
      editorAfter: ".",
      hostH: "Host",
      hostBody:
        "This site is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA — vercel.com. [To confirm depending on the host chosen.]",
      ipH: "Intellectual property",
      ipBody:
        "All content on this site (brand, logotype, text, visuals, graphic design and code) is the exclusive property of [TO COMPLETE — legal name] or its partners. Any reproduction, representation or use, in whole or in part, without prior written authorisation is prohibited.",
    },
  },
};

export type Dictionary = typeof en;

