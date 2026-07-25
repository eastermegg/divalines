// Supabase Edge Function — mirrors each new lead into the Notion database.
// Triggered by a Database Webhook on INSERT of public.leads (spec §6.2).
// Always answers 200: Supabase retries transient failures, and the pg_cron
// catch-up job re-syncs anything still marked notion_synced = false.
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { record } = await req.json();

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("NOTION_TOKEN")}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: Deno.env.get("NOTION_DATABASE_ID") },
      properties: {
        "Email":      { title: [{ text: { content: record.email } }] },
        "Inscrit le": { date: { start: record.created_at } },
        "Source":     { select: { name: record.source ?? "landing" } },
        "Langue":     { rich_text: [{ text: { content: record.locale ?? "" } }] },
        "UTM":        { rich_text: [{ text: { content: JSON.stringify(record.utm ?? {}) } }] },
        "Statut":     { select: { name: "New" } },
      },
    }),
  });

  if (res.ok) {
    const page = await res.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase
      .from("leads")
      .update({ notion_synced: true, notion_page_id: page.id })
      .eq("id", record.id);
  } else {
    console.error("[sync-notion] Notion API error:", res.status, await res.text());
  }

  return new Response("ok");
});
