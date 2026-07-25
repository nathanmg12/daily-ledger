---
description: Generate a new batch of Daily Ledger cards — 14 of each of the 7 card types, tagged and duplicate-checked, ready for manual review and Supabase insert.
---

# New Card Batch

Generates 14 cards for each of the 7 card types (252 cards total: 14
`quick_facts` for each of the 12 applicable interests, plus 14 each of
`quote`, `scripture`, `book_summary`, `food_spotlight`, `protocol`, and
`research`). Follows the voice rules, JSON structures, and tagging logic in
`CLAUDE.md` at the project root — read that file first if it isn't already
in context.

## Steps

1. **Pull existing titles from Supabase**, read-only, using
   `SUPABASE_SERVICE_KEY` from `.env.local`:
   - For `quick_facts`: titles grouped by interest (via `card_interests`)
   - For every other type: all titles for that type
   Do not write to Supabase at any point in this skill.

2. **Generate content**, type by type:
   - `quick_facts`: 14 per interest, for each of the 12 interests that use
     this type (all except Quotes & Wisdom and Scripture & Faith)
   - `quote`, `scripture`, `book_summary`, `food_spotlight`, `protocol`,
     `research`: 14 each
   Follow the JSON structure and voice rules in `CLAUDE.md` exactly. Vary
   sources, authors, and subtopics within a type/interest — don't cluster
   around the same few examples.

3. **Tag each card** per the rules in `CLAUDE.md`. For judgment-call tags
   (secondary tags on `quote`, `protocol`, `research`, `book_summary`),
   include your reasoning as a one-line comment in the output so Nathan can
   evaluate the call, not just the result.

4. **Check for duplicates** against the titles pulled in step 1, using the
   title-generation formula and duplicate-detection logic in `CLAUDE.md`.
   Flag likely duplicates — don't drop them, don't include them unflagged.

5. **Write output** to `generated/<today's date>/`, one JSON file per
   type/interest combination (18 files total: 12 for `quick_facts`, one each
   for the other 6 types). Each file is a plain JSON array of card content
   objects — the same shape `tdl-card-builder.html` expects when pasted into
   its input box. Include the interest name in quick_facts filenames, e.g.
   `generated/2026-07-25/quick_facts-personal-finance.json`.

6. **Stop.** Print a short summary: total cards generated, how many flagged
   as possible duplicates and why, and the output folder path. Do not open
   or modify any other files in the repo.
