// scripts/generate-cards.js - DEBUG VERSION

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log("SUPABASE_URL value:", supabaseUrl);
console.log("SUPABASE_URL length:", supabaseUrl?.length);
console.log("SUPABASE_SERVICE_KEY set:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase
    .from("interests")
    .select("id, name")
    .limit(1);

  if (error) {
    console.error("Supabase error:", error);
  } else {
    console.log("Success! First interest:", data);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
