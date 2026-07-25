import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy policy — ${SITE.name}`,
  robots: { index: false },
};

const CONTACT_EMAIL = "privacy@divalines.com";

export default function PrivacyPage() {
  return (
    <main className="container-editorial max-w-[72ch] py-24">
      <a href="/" className="text-xs tracking-[0.14em] text-cream/50 uppercase hover:text-cream">
        ← Diva Lines
      </a>

      <h1 className="mt-8 font-serif text-3xl text-cream italic">Privacy policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-cream/75">
        <section className="space-y-2">
          <h2 className="font-medium text-cream">What we collect</h2>
          <p>
            When you join the waitlist we store your email address, the date
            of signup, your browser language, optional campaign parameters
            (UTM), and a salted hash of your IP address used only for abuse
            prevention. Your raw IP address is never stored.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">Why we collect it</h2>
          <p>
            Solely to send you updates about the {SITE.name} launch. Legal
            basis: your explicit consent, given when you submit the form.
            No advertising, no profiling, no sale of data. Ever.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">Where it lives</h2>
          <p>
            Data is stored with our processors Supabase (database, EU-hosted
            project) and mirrored to Notion for the team&apos;s consultation.
            Both act under data-processing agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">How long we keep it</h2>
          <p>
            Until 24 months after the brand launch, or until you unsubscribe
            — whichever comes first. Every email we send includes an
            unsubscribe link.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">Your rights</h2>
          <p>
            Under the GDPR you can access, rectify, export or erase your
            data, and withdraw consent at any time. Write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>{" "}
            — we answer within 30 days. You may also lodge a complaint with
            the CNIL (cnil.fr).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">Cookies</h2>
          <p>
            This site sets no tracking cookies. A single sessionStorage flag
            remembers whether you&apos;ve seen the intro animation; it never
            leaves your browser.
          </p>
        </section>

        <section id="legal" className="space-y-2 border-t border-cream/10 pt-6">
          <h2 className="font-medium text-cream">Legal notice</h2>
          <p>
            {SITE.name} — {SITE.brandLine.join(" · ")}. Publication director
            and hosting details will be completed before commercial launch.
            Contact:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
