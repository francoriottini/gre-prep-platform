import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sampleQuestions } from "@/lib/quiz";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import type { GenerateQuizResponse, QuizQuestion } from "@/lib/types";
import { generateQuizSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("questions")
      .select("id, topic, subtopic, difficulty, stem, choices")
      .eq("section", "quant")
      .eq("status", "published");

    if (payload.topic) {
      query = query.eq("topic", payload.topic);
    }
    if (payload.subtopic?.length) {
      query = query.in("subtopic", payload.subtopic);
    }
    if (payload.difficulty?.length) {
      query = query.in("difficulty", payload.difficulty);
    }

    const { data, error } = await query.limit(600);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const questions = (data ?? []) as QuizQuestion[];
    if (questions.length < payload.n_questions) {
      return NextResponse.json(
        {
          error: "Not enough published questions for selected filters.",
          available: questions.length
        },
        { status: 400 }
      );
    }

    const sampled = sampleQuestions(questions, payload.n_questions);

    const response: GenerateQuizResponse = {
      quiz_id: randomUUID(),
      generated_at: new Date().toISOString(),
      section: "quant",
      time_limit: payload.time_limit,
      requested_filters: {
        topic: payload.topic,
        subtopic: payload.subtopic,
        difficulty: payload.difficulty,
        n_questions: payload.n_questions,
        time_limit: payload.time_limit
      },
      questions: sampled
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
