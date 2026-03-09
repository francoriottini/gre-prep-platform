import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
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

    const userId = await getAuthenticatedUserId(request.headers);
    const payload = parsed.data;
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase.from("item_feedback").insert({
      question_id: payload.question_id,
      user_id: userId,
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
