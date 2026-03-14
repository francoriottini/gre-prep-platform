import { NextResponse } from "next/server";
import { getAuthenticatedRequest } from "@/lib/auth";
import { createSupabaseServiceClient, createSupabaseUserServerClient } from "@/lib/supabase-server";
import { itemFeedbackSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = itemFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const auth = await getAuthenticatedRequest(request.headers);
    if (!auth) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const payload = parsed.data;
    const userSupabase = createSupabaseUserServerClient(auth.accessToken);
    const serviceSupabase = createSupabaseServiceClient();

    const { data: publishedQuestion, error: questionError } = await serviceSupabase
      .from("questions")
      .select("id")
      .eq("id", payload.question_id)
      .eq("status", "published")
      .maybeSingle();

    if (questionError || !publishedQuestion) {
      return NextResponse.json({ error: "Question not found." }, { status: 400 });
    }

    if (payload.attempt_id) {
      const { data: ownedAttempt, error: attemptError } = await userSupabase
        .from("quiz_attempts")
        .select("id")
        .eq("id", payload.attempt_id)
        .eq("user_id", auth.userId)
        .maybeSingle();

      if (attemptError || !ownedAttempt) {
        return NextResponse.json({ error: "Attempt not found for current user." }, { status: 403 });
      }
    }

    const { error } = await userSupabase.from("item_feedback").insert({
      question_id: payload.question_id,
      user_id: auth.userId,
      attempt_id: payload.attempt_id ?? null,
      feedback_type: payload.feedback_type,
      comment: payload.comment ?? null,
      difficulty_vote: payload.difficulty_vote ?? null
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
