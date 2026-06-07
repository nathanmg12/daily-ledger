// scripts/generate-cards.js
//
// THE DAILY LEDGER — Card Generation Script

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CARDS_PER_INTEREST = 2;
const NEWS_EXPIRY_HOURS = 72;
const DELAY_BETWEEN_CALLS_MS = 8000; // 8 seconds to stay under rate limit

const VOICE_PROMPT = `
You are a writer for The Daily Ledger — a daily reading app built for people
who want to learn something real without being manipulated into staying longer
than they should. Every card you write is finite, purposeful, and complete.

Write like a smart, well-read friend who happens to know a lot about this topic.
Not a professor. Not a content marketer. Someone who respects the reader's time
and intelligence, and gets to the point without being cold about it.

Voice rules:
- Write with varied rhythm. Long sentences carry nuance. Short ones land hard. Mix them. Do not default to short sentences as a style. Do not string together fragments to sound punchy.
- No em-dashes. Restructure the sentence instead.
- Never open with filler: "In today's world," "It's worth noting," "Delve into," "Certainly," etc. Start with the thing itself.
- Be specific. Use real numbers, real names, real details.
- No hedging chains. If something is true, say it. If uncertain, say so once and move on.
- Stay neutral. Never voice opinions. Do not editorialize.
- End with weight. The last sentence should land. Never trail off.

Formatting rules:
- Return only valid JSON. No preamble, no explanation, no markdown code fences.
- Match the exact field names and structure specified in the prompt.
- All text values are plain strings. No markdown inside JSON values.
- Do not add fields that are not in the spec.
`.trim();

function buildNewsPrompt(interestName) {
  return `
You are writing a news card for The Daily Ledger.

Search for a real, recent news story published within the last 72 hours on the topic: ${interestName}.
The story should be substantive -- something that affects how the reader understands the world.

Return ONLY this JSON object, with no text before or after it:

{
  "headline": "A clean, factual headline",
  "summary": "Three to four sentences of plain-English summary",
  "source_name": "Publication name",
  "source_url": "https://example.com",
  "published_at": "YYYY-MM-DD",
  "rabbit_hole": "A single curiosity question the story raises?"
}
`.trim();
}

// Extract JSON from response even if there's surrounding text
function extractJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return JSON.parse(text.slice(start, end + 1));
}

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

  const content = extractJSON(textBlock.text);
  const requiredFields = ["headline", "summary", "source_name", "source_url", "published_at", "rabbit_hole"];
  for (const field of requiredFields) {
    if (!content[field]) throw new Error(`Missing field: ${field}`);
  }

  return content;
}

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
      } catch (err) {
        console.error(`  Failed for ${interest.name} (card ${i + 1}): ${err.message}\n`);
        totalFailed++;
      }

      // Always wait between calls, whether success or failure
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS_MS));
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
