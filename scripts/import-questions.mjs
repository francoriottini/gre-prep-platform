import { createClient } from "@supabase/supabase-js";
import {
  loadQuestionBank,
  resolveInputPath,
  validateQuestionBank
} from "./question-bank-utils.mjs";

function env(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const fileArg = process.argv[2] ?? "content/questions.quant.sample.json";
const inputPath = resolveInputPath(fileArg);

async function run() {
  const questionBank = loadQuestionBank(inputPath);
  const validation = validateQuestionBank(questionBank);
  if (!validation.valid) {
    throw new Error(`Question bank validation failed:\n${validation.errors.join("\n")}`);
  }

  const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const rows = questionBank.map((q) => ({
    section: q.section,
    topic: q.topic,
    subtopic: q.subtopic,
    difficulty: q.difficulty,
    stem: q.stem,
    choices: q.choices,
    correct_choice: q.correct_choice,
    explanation_en: q.explanation_en,
    explanation_es: q.explanation_es,
    source_type: q.source_type,
    status: q.status,
    reviewer_1: q.reviewer_1 ?? null,
    reviewer_2: q.reviewer_2 ?? null,
    quality_flags: q.quality_flags ?? {},
    published_at: q.status === "published" ? new Date().toISOString() : null
  }));

  const { data, error } = await supabase
    .from("questions")
    .upsert(rows, { onConflict: "section,topic,subtopic,stem" })
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  console.log(`Imported questions: ${data?.length ?? 0}`);
}

run().catch((error) => {
  console.error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
