# The Daily Ledger — Claude Code Project Instructions

The Daily Ledger (TDL) is a calm, finite daily reading app. Non-algorithmic,
non-addictive. All card content is evergreen — no news, no trending topics.

This file governs any Claude Code session working in this repo. For card
generation specifically, see `.claude/skills/new-card-batch/SKILL.md`.

---

## Voice — follow on every card, every field

Write like a smart, well-read friend who knows the topic well. Not a
professor, not a content marketer. Respect the reader's time and intelligence.

- **Varied rhythm.** Mix long and short sentences. Don't default to short
  choppy fragments — that reads as AI slop just as much as purple prose does.
- **No em-dashes.** Restructure the sentence instead.
- **Never open with filler.** No "In today's world," "It's worth noting,"
  "Delve into," "Certainly," or variants. Start with the thing itself.
- **Be specific.** Real numbers, real names, real studies. "A study of 22,000
  people tracked over 8 years" beats "research suggests."
- **No hedging chains.** State what's true. State what's uncertain once,
  clearly, and move on.
- **Stay neutral.** Present findings and ideas without editorializing or
  nudging the reader toward a conclusion. Applies across health, finance,
  faith, everything.
- **End with weight.** Last sentence should land — a practical implication,
  a reframing, a detail that sticks. Never trail off or summarize.
- **Write to be read once, not skimmed.** Full connected prose, not bullets.

Return only valid JSON for card content. No preamble, no markdown fences, no
fields outside the spec below.

---

## The 14 interests (confirmed live, do not use any other list)

| Interest | UUID |
|---|---|
| Business & Entrepreneurship | `d234c2c2-645b-4066-8f9c-fff3365a8f9a` |
| Fashion & Style | `300ac2b2-7326-470f-ad84-e5fb16e8c808` |
| Fitness & Health | `199594b9-ef32-45d7-ab0d-239576c945d6` |
| Food & Nutrition | `fa4bddbb-0436-4ea9-9fb0-59eb78e30f02` |
| Home & Design | `e91c20de-f53a-4ef0-abda-d3855166f138` |
| Marketing & Branding | `cc68b139-406a-4846-8e9e-dc8c7f4ee59b` |
| Outdoors & Nature | `cb7f5369-b5ee-497b-9ea2-b76435b050ea` |
| Personal Finance | `45759c78-b498-489e-9457-65bd17553ea7` |
| Philosophy & Stoicism | `7d78ad5a-3376-4536-b230-f46e2758fff6` |
| Psychology & Behavior | `ae86b0a4-34ad-4db2-ad59-18b581c014dd` |
| Quotes & Wisdom | `131eaf25-0218-4775-a7ac-58be66c1b138` |
| Science & Technology | `d8506343-459c-434e-9c40-7ac83b3cf80e` |
| Scripture & Faith | `0816e404-bc25-4bec-a5ee-0c857874a79f` |
| Sleep & Recovery | `fbe6153f-38e9-4ae5-bc54-7181240388b5` |

`supabase-reference.md`, if still present in this repo, is out of date (lists
18 interests including ones that no longer exist). Treat this table as the
source of truth, or query the `interests` table directly.

---

## The 7 card types — JSON structures

### `scripture`
```json
{
  "verse": "For I know the plans I have for you...",
  "reference": "Jeremiah 29:11",
  "translation": "CSB",
  "context": "Historical or literary weight behind the verse — what a modern reader might miss."
}
```
CSB translation only. Tags: **Scripture & Faith only.**

### `quote`
```json
{
  "quote": "You have power over your mind, not outside events.",
  "author": "Marcus Aurelius",
  "source": "Meditations",
  "context": "What was this person's life like when they said or wrote this?"
}
```
Tags: **Quotes & Wisdom always.** Add Philosophy & Stoicism only when the
quote is genuinely Stoic in origin (Marcus Aurelius, Seneca, Epictetus, etc.)
— this is a judgment call, not automatic. Most quotes get one tag only.

### `quick_facts`
```json
{
  "fact": "2-4 sentences. Specific, grounded, surprising where possible. No hedging, no filler opener.",
  "search_prompt": "A natural-language question the reader could fire off if curious — not a statement."
}
```
Tags: **single interest only** — whichever interest the batch is generated
for. Generated for 12 of the 14 interests (all except Quotes & Wisdom and
Scripture & Faith, which have their own dedicated card types instead).

### `research`
```json
{
  "title": "Plain-English claim, not the paper's actual title",
  "journal": "Nature Neuroscience",
  "published_at": "2026-05-30",
  "tldr": "Two sentence plain-English summary",
  "body": "Fuller explanation of the findings",
  "takeaway": "One sentence practical implication"
}
```
Tags: primary interest + any others the findings genuinely touch. Judgment
call, no fixed default — current pool spans Fitness & Health, Psychology &
Behavior, Science & Technology, Sleep & Recovery, Food & Nutrition, Personal
Finance, and others.

### `protocol`
```json
{
  "name": "Morning Sunlight Exposure",
  "source": "Huberman Lab",
  "evidence_level": "strong",
  "overview": "What it is and why it matters",
  "specs": {"timing": "...", "duration": "...", "cost": "..."},
  "how_it_works": "The science behind it",
  "how_to_start": "Actionable first step tomorrow morning, not general advice"
}
```
`evidence_level`: `strong`, `moderate`, or `emerging`. `source` weighted
toward Huberman Lab, with Peter Attia, Rhonda Patrick, Andy Galpin mixed in.
Tags: **Fitness & Health always.** Add Sleep & Recovery, Food & Nutrition, or
Outdoors & Nature when the protocol genuinely touches those (judgment call).

### `food_spotlight`
```json
{
  "name": "Raw Honey",
  "badges": ["Ancient food", "Evidence: Strong"],
  "intro": "Why this food is worth knowing about",
  "specs": {"type": "...", "human_use": "...", "key_compounds": "..."},
  "what_research_shows": "What the science actually says",
  "caveats": "Honest limitations and warnings — not optional",
  "bottom_line": "One paragraph verdict"
}
```
`badges[0]`: `Ancient food` / `Modern food` / `Supplement`. `badges[1]`:
`Evidence: Strong` / `Moderate` / `Mixed` / `Limited`. Extra rigor on
supplements — only well-established effects. Tags: **always both** Food &
Nutrition and Fitness & Health, no exceptions.

### `book_summary`
```json
{
  "title": "Outlive: The Science and Art of Longevity",
  "author": "Peter Attia",
  "cover_emoji": "♥",
  "ideas": [{"number": "01", "title": "Specific claim, not a vague topic label", "body": "..."}],
  "search_prompt": "[Book Title] [Author Last Name]"
}
```
Max 5 ideas. Tags: primary interest + any others the book's themes cover.
Judgment call, no fixed default.

---

## Title generation (must match exactly — used for duplicate detection)

- `scripture`: the `reference` field
- `quote`: `${author} — ${quote.substring(0,40)}`
- `quick_facts`: `fact.substring(0,80)`
- `book_summary`: the `title` field
- `food_spotlight`: the `name` field
- `protocol`: the `name` field
- `research`: the `title` field

## Duplicate detection

Before generating, pull existing titles for the relevant type (and interest,
for `quick_facts`) from Supabase. Normalize both existing and candidate
titles — lowercase, strip non-alphanumeric characters, collapse whitespace —
then compare the first 45 characters. If they match or one contains the
other's first 45 characters, treat it as a likely duplicate and flag it
rather than silently discarding or silently including it. This mirrors the
logic already in `tdl-card-builder.html` (`normalize` / `isSimilar`).

## Database access

`SUPABASE_SERVICE_KEY` is in `.env.local` for read access to check existing
titles. **Never write directly to the `cards` or `card_interests` tables.**
All generated content goes to a review file — Nathan approves and inserts
manually via the card builder, same as always.

**The card builder needs the service key, not the anon key.** `cards` and
`card_interests` used to carry `INSERT` policies for the `anon` role with
`WITH CHECK (true)`. Since the anon key ships in the public client bundle,
that let anyone write cards into the library and have them served to readers,
so both policies were dropped on 2026-08-03. Reads are unchanged. If the
builder starts returning row-level security errors on insert, the key in its
key field is the anon key and needs swapping for the service key.
