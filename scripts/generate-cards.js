// scripts/generate-cards.js
//
// THE DAILY LEDGER — Card Generation Script
//
// Called by GitHub Actions every morning at 3:00 AM ET.
// Generates 2 news cards per interest and writes them to Supabase.

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// ── Clients ───────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Constants ─────────────────────────────────────────────
const CARDS_PER_INTEREST = 2;
const NEWS_EXPIRY_HOURS = 72;

// ── Master voice system prompt ────────────────────────────
const VOICE_PROMPT = `
You are a writer for The Daily Ledger — a daily reading app built for people
who want to learn something real without being manipulated into staying longer
than they should. Every card you write is finite, purposeful, and complete. The
reader should feel informed and satisfied, not hungry for more in an anxious way.

Write like a smart, well-read friend who happens to know a lot about this topic.
Not a professor. Not a content marketer. Someone who respects the reader's time
and intelligence, and gets to the point without being cold about it.

Voice rules:
- Write with varied rhythm. Long sentences carry nuance. Short ones land hard. Mix them. Do not default to short sentences as a style. Do not string together fragments to sound punchy.
- No em-dashes. Restructure the sentence instead.
- Never open with filler: "In today's world," "It's worth noting," "Delve into," "Certainly," etc. Start with the thing itself.
- Be specific. Use real numbers, real names, real details. "A study of 22,000 people" is better than "research suggests."
- No hedging chains. If something is true, say it. If uncertain, say so once and move on.
- Stay neutral. Never voice opinions. Present findings and context as they are. Do not editorialize or nudge the reader toward any conclusion.
- End with weight. The last sentence should land. Never trail off.
- Write to be read once, not skimmed. Prose matters. Each sentence should earn its place.

Formatting rules:
- Return only valid JSON. No preamble, no explanation, no markdown code fences.
- Match the exact field names and structure specified in the prompt.
- All text values are plain strings. No markdown inside JSON values.
- Do not add fields that aren't in the spec.
`.trim();

// ── News card prompt ──────────────────────────────────────
function buildNewsPrompt(interestName) {
  return `
You are writing a news card for The Daily Ledger.

Search for a real, recent news story published within the last 72 hours on the
topic: ${interestName}. The story should be substantive -- something that affects
how the reader understands the world, not a trending story forgotten by tomorrow.

For the summary field: three to four sentences of plain-English explanation. No
jargon. No hype. State what happened, what it means, and why it matters. Do not
editorialize. Do not tell the reader how to feel about it.

For the rabbit_hole field: write a single curiosity question the story naturally
raises. It should feel like a natural next thought, not a clickbait prompt.
Frame it as a question.

Return the following JSON exactly:

{
  "headline": "A clean, factual headline",
  "summary": "Three to four sentences of plain-English summary...",
  "source_name": "Publication name",
  "source_url": "https://...",
  "published_at": "YYYY-MM-DD",
  "rabbit_hole": "A single curiosity question the story raises?"
}
`.trim();
}

// ── Generate a single news card via Claude API ────────────
async function generateNewsCard(interest) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    system: VOICE_PROMPT,
    messages: [
      { role: "user", content: buildNewsPrompt(interest.name) }
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) throw new Error("No text block in response");

  const content = JSON.parse(textBlock.text.trim());
  const requiredFields = ["headline", "summary", "source_name", "source_url", "published_at", "rabbit_hole"];
  for (const field of requiredFields) {
    if (!content[field]) throw new Error(`Missing field: ${field}`);
  }

  return content;
}

// ── Write a card to Supabase ──────────────────────────────
async function saveCard(interest, content) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + NEWS_EXPIRY_HOURS);

  const { error } = await supabase.from("cards").insert({
    interest_id: interest.id,
    type: "news",
    title: content.headline,
    content: content,
    source: content.source_url,
    is_evergreen: false,
    expires_at: expiresAt.toISOString(),
    created_by: "github_actions",
    tags: [],
  });

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log("Starting Daily Ledger card generation...\n");

  const { data: interests, error } = await supabase
    .from("interests")
    .select("id, name, slug")
    .eq("is_active", true)
    .eq("has_news", true);

  if (error) throw new Error(`Failed to fetch interests: ${error.message}`);
  console.log(`Found ${interests.length} news-enabled interests\n`);

  let totalGenerated = 0;
  let totalFailed = 0;

  for (const interest of interests) {
    for (let i = 0; i < CARDS_PER_INTEREST; i++) {
      try {
        console.log(`Generating card ${i + 1}/${CARDS_PER_INTEREST} for: ${interest.name}`);
        const content = await generateNewsCard(interest);
        await saveCard(interest, content);
        console.log(`  Saved: "${content.headline}"\n`);
        totalGenerated++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err) {
        console.error(`  Failed for ${interest.name} (card ${i + 1}): ${err.message}\n`);
        totalFailed++;
      }
    }
  }

  console.log("-------------------------------------");
  console.log(`Done. Generated: ${totalGenerated} | Failed: ${totalFailed}`);
  console.log("-------------------------------------");

  if (totalFailed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
