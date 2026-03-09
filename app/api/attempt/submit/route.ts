import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { toWeekStart } from "@/lib/quiz";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import type { SubmitAttemptResponse } from "@/lib/types";
import { submitAttemptSchema } from "@/lib/validation";

type QuestionAnswerRow = {
  id: string;
  correct_choice: string;
  explanation_en: string;
  explanation_es: string;
  topic: string;
  subtopic: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const answerIds = payload.answers.map((a) => a.question_id);
    const supabase = createSupabaseServiceClient();

    const { data: questionRows, error: questionError } = await supabase
      .from("questions")
      .select("id, correct_choice, explanation_en, explanation_es, topic, subtopic")
      .in("id", answerIds);

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 });
    }

    const questionMap = new Map<string, QuestionAnswerRow>();
    for (const row of (questionRows ?? []) as QuestionAnswerRow[]) {
      questionMap.set(row.id, row);
    }

    if (questionMap.size !== answerIds.length) {
      return NextResponse.json(
        { error: "One or more submitted question IDs are invalid." },
        { status: 400 }
      );
    }

    let correct = 0;
    let totalTime = 0;
    const results = payload.answers.map((answer) => {
      const row = questionMap.get(answer.question_id)!;
      const isCorrect = row.correct_choice === answer.selected_choice;
      if (isCorrect) {
        correct += 1;
      }
      totalTime += answer.time_spent_seconds;
      return {
        question_id: answer.question_id,
        selected_choice: answer.selected_choice,
        correct_choice: row.correct_choice,
        is_correct: isCorrect,
        explanation_en: row.explanation_en,
        explanation_es: row.explanation_es,
        topic: row.topic,
        subtopic: row.subtopic,
        time_spent_seconds: answer.time_spent_seconds
      };
    });

    const totalQuestions = results.length;
    const accuracy = totalQuestions ? Number(((correct / totalQuestions) * 100).toFixed(2)) : 0;
    const avgTimeSeconds = totalQuestions ? Number((totalTime / totalQuestions).toFixed(2)) : 0;

    let saved = false;
    let attemptId: string | null = null;
    const userId = await getAuthenticatedUserId(request.headers);

    if (userId) {
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: userId,
          section: "quant",
          requested_filters: payload.requested_filters,
          time_limit_seconds: payload.time_limit_seconds,
          total_questions: totalQuestions,
          correct_answers: correct,
          score_accuracy: accuracy,
          avg_time_seconds: avgTimeSeconds,
          submitted_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (!attemptError && attempt) {
        attemptId = attempt.id;
        const itemRows = results.map((item) => ({
          attempt_id: attempt.id,
          question_id: item.question_id,
          selected_choice: item.selected_choice,
          is_correct: item.is_correct,
          time_spent_seconds: item.time_spent_seconds
        }));

        const { error: itemError } = await supabase.from("attempt_items").insert(itemRows);
        if (!itemError) {
          saved = true;
          const weekStart = toWeekStart();
          const groupMap = new Map<
            string,
            { topic: string; subtopic: string; answered: number; correct: number; totalTime: number }
          >();

          for (const item of results) {
            const key = `${item.topic}:::${item.subtopic}`;
            const prev = groupMap.get(key) ?? {
              topic: item.topic,
              subtopic: item.subtopic,
              answered: 0,
              correct: 0,
              totalTime: 0
            };
            prev.answered += 1;
            prev.correct += item.is_correct ? 1 : 0;
            prev.totalTime += item.time_spent_seconds;
            groupMap.set(key, prev);
          }

          for (const group of groupMap.values()) {
            const { data: existing } = await supabase
              .from("mastery_snapshots")
              .select("id, questions_answered, accuracy, avg_time_seconds")
              .eq("user_id", userId)
              .eq("topic", group.topic)
              .eq("subtopic", group.subtopic)
              .eq("snapshot_week", weekStart)
              .maybeSingle();

            const nextAnswered = (existing?.questions_answered ?? 0) + group.answered;
            const existingCorrect = ((existing?.accuracy ?? 0) / 100) * (existing?.questions_answered ?? 0);
            const nextCorrect = existingCorrect + group.correct;
            const nextAccuracy = nextAnswered
              ? Number(((nextCorrect / nextAnswered) * 100).toFixed(2))
              : 0;
            const existingTotalTime =
              (existing?.avg_time_seconds ?? 0) * (existing?.questions_answered ?? 0);
            const nextTotalTime = existingTotalTime + group.totalTime;
            const nextAvgTime = nextAnswered ? Number((nextTotalTime / nextAnswered).toFixed(2)) : 0;

            await supabase.from("mastery_snapshots").upsert(
              {
                id: existing?.id,
                user_id: userId,
                topic: group.topic,
                subtopic: group.subtopic,
                questions_answered: nextAnswered,
                accuracy: nextAccuracy,
                avg_time_seconds: nextAvgTime,
                snapshot_week: weekStart
              },
              {
                onConflict: "user_id,topic,subtopic,snapshot_week"
              }
            );
          }
        }
      }
    }

    const response: SubmitAttemptResponse = {
      saved,
      attempt_id: attemptId,
      summary: {
        total_questions: totalQuestions,
        correct_answers: correct,
        accuracy,
        avg_time_seconds: avgTimeSeconds
      },
      results
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
