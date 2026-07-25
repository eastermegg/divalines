import { Wordmark } from "@/components/Brand";
import WaitlistForm from "@/components/WaitlistForm";
import { SITE, SOCIALS } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-cream/10">
      <div className="container-editorial py-[clamp(4rem,10vh,8rem)]">
        <p className="font-serif text-manifesto text-cream italic lowercase">
          join the first line.
        </p>
        <div className="mt-8 max-w-[560px]">
          <WaitlistForm compact />
        </div>

        <div className="mt-16 flex flex-col gap-6 text-xs text-cream/60 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 tracking-[0.14em] uppercase">
            {SITE.brandLine.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <nav aria-label="Social and legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                {s.label}
              </a>
            ))}
            <a href="/privacy" className="transition-colors hover:text-cream">
              Privacy policy
            </a>
            <a href="/privacy#legal" className="transition-colors hover:text-cream">
              Legal notice
            </a>
          </nav>

          <p>© 2026 {SITE.name}. All rights reserved.</p>
        </div>

        {/* Full wordmark signature */}
        <Wordmark className="mt-16 w-full text-cream/15" />
      </div>
    </footer>
  );
}
