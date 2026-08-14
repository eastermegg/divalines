import { z } from "zod";

export const WaitlistBody = z.object({
  email: z.string().trim().email().max(254),
  /** Honeypot — real users never see this field; any value marks a bot.
   * No max(0): the field must VALIDATE so the route can answer a fake
   * success (a 400 would tip the bot off). */
  company: z.string().optional(),
  utm: z.record(z.string()).optional(),
});

export type WaitlistBodyType = z.infer<typeof WaitlistBody>;

export const QuizBody = z.object({
  email: z.string().trim().email().max(254),
  /** Honeypot — see WaitlistBody.company. */
  company: z.string().optional(),
  /** The five-energy spectrum, e.g. { "L'Onde": 42, "Le Murmure": 24, ... }.
   * Kept as an open record (not a fixed 5 keys) so the quiz copy can evolve
   * without a schema migration; values are clamped 0–100, 1–12 entries. */
  scores: z
    .record(z.string().max(40), z.number().finite().min(0).max(100))
    .refine((s) => Object.keys(s).length >= 1 && Object.keys(s).length <= 12, {
      message: "scores must have 1–12 entries",
    }),
  /** Derived diva-profile label; the route falls back to the top energy. */
  profile: z.string().max(80).optional(),
  utm: z.record(z.string()).optional(),
});

export type QuizBodyType = z.infer<typeof QuizBody>;
