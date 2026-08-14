import type { Metadata } from "next";
import WavesExperience from "@/components/variants/waves/WavesExperience";

/**
 * Preloader proposal "/waves" — a sandbox for the chromatic-waves entry
 * sequence (logo + "made for movement" tagline). Not indexed while under
 * evaluation.
 */
export const metadata: Metadata = { robots: { index: false } };

export default function WavesPage() {
  return <WavesExperience />;
}
