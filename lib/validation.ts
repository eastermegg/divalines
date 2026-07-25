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
