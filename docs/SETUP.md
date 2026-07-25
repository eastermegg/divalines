# Diva Lines — provisioning guide

The app runs locally with **zero env vars** (the waitlist API logs a
`[waitlist:dev-mode]` line instead of inserting). Follow this guide when
you're ready to wire the real backend. Steps map to spec §7.

## 1. Supabase

```bash
brew install supabase/tap/supabase
supabase init
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations/0001_leads.sql
```

Then copy the project URL + service role key into `.env.local`:

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server only — NEVER NEXT_PUBLIC
IP_SALT=<any long random string>
```

## 2. Notion database

Create a database **"Diva Lines — Waitlist"** with exactly these properties:

| Property | Type | Filled with |
|---|---|---|
| Email | Title | lead email |
| Inscrit le | Date | created_at |
| Source | Select | source |
| Langue | Text | locale |
| UTM | Text | serialized utm |
| Statut | Select (New / Contacted / Converted) | "New" |

Then on [notion.so/my-integrations](https://www.notion.so/my-integrations):
create an **internal integration** (capability: Insert content), copy the
token, and **connect the integration to the database** (••• menu →
Connections). The database ID is the 32-char segment of its URL.

## 3. Edge Function + webhook

```bash
supabase secrets set NOTION_TOKEN=ntn_... NOTION_DATABASE_ID=...
supabase functions deploy sync-notion
```

Dashboard → Database → Webhooks → new webhook:
table `leads`, event `INSERT`, target = Edge Function `sync-notion`.

## 4. Catch-up cron (safety net)

Notion can be down for a day without losing a single lead: schedule
`pg_cron` (Dashboard → SQL editor) to re-invoke the function hourly for
every lead with `notion_synced = false` older than 10 minutes, e.g. via a
`select net.http_post(...)` over those rows (or run the equivalent from
any scheduler you already operate).

## 5. Vercel

```bash
vercel link
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add IP_SALT
vercel env add RELEASE_DATE        # e.g. 2026-10-01T18:00:00+02:00
vercel --prod
```

## 6. Verifying the pipeline

```bash
# valid → row in Supabase + page in Notion
curl -s -X POST localhost:3000/api/waitlist -H 'content-type: application/json' \
  -d '{"email":"test@example.com"}'

# duplicate → {"ok":true} silently, no second row
# honeypot → {"ok":true}, nothing in base
curl -s -X POST localhost:3000/api/waitlist -H 'content-type: application/json' \
  -d '{"email":"bot@example.com","company":"x"}'

# 6 rapid posts from one IP → 6th answers 429
```

## Rate-limit note

`lib/rate-limit.ts` is an in-memory sliding window (5 req / 10 min / IP),
**per warm serverless instance** — state resets on deploy and each instance
counts separately. Fine for a waitlist; if you need a global limit, swap
the function body for Upstash Redis or a Supabase `rate_limits` table
(the async signature already allows it).
