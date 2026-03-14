import { NextResponse } from "next/server";
import { getAuthenticatedRequest } from "@/lib/auth";
import { createSupabaseUserServerClient } from "@/lib/supabase-server";
import type { ProgressSummaryResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedRequest(request.headers);
    if (!auth) {
      const guestResponse: ProgressSummaryResponse = {
        mode: "guest",
        overall: null,
        by_topic: [],
        weekly_trend: []
      };
      return NextResponse.json(guestResponse, { status: 200 });
    }

    const supabase = createSupabaseUserServerClient(auth.accessToken);

    const [{ data: attempts, error: attemptsError }, { data: snapshots, error: snapshotsError }] =
      await Promise.all([
        supabase
          .from("quiz_attempts")
          .select("score_accuracy, avg_time_seconds, submitted_at")
          .eq("user_id", auth.userId)
          .order("submitted_at", { ascending: false })
          .limit(300),
        supabase
          .from("mastery_snapshots")
          .select("topic, questions_answered, accuracy, avg_time_seconds, snapshot_week")
          .eq("user_id", auth.userId)
          .order("snapshot_week", { ascending: false })
          .limit(500)
      ]);

    if (attemptsError) {
      return NextResponse.json({ error: attemptsError.message }, { status: 500 });
    }
    if (snapshotsError) {
      return NextResponse.json({ error: snapshotsError.message }, { status: 500 });
    }

    const attemptRows = attempts ?? [];
    const overall =
      attemptRows.length > 0
        ? {
            attempts: attemptRows.length,
            accuracy: Number(
              (
                attemptRows.reduce((sum, row) => sum + Number(row.score_accuracy || 0), 0) /
                attemptRows.length
              ).toFixed(2)
            ),
            avg_time_seconds: Number(
              (
                attemptRows.reduce((sum, row) => sum + Number(row.avg_time_seconds || 0), 0) /
                attemptRows.length
              ).toFixed(2)
            )
          }
        : { attempts: 0, accuracy: 0, avg_time_seconds: 0 };

    const topicMap = new Map<string, { answered: number; weightedAccuracy: number; totalTime: number }>();
    const weekMap = new Map<string, { answered: number; weightedAccuracy: number }>();

    for (const row of snapshots ?? []) {
      const answered = Number(row.questions_answered || 0);
      const acc = Number(row.accuracy || 0);
      const avgTime = Number(row.avg_time_seconds || 0);

      const topicEntry = topicMap.get(row.topic) ?? { answered: 0, weightedAccuracy: 0, totalTime: 0 };
      topicEntry.answered += answered;
      topicEntry.weightedAccuracy += acc * answered;
      topicEntry.totalTime += avgTime * answered;
      topicMap.set(row.topic, topicEntry);

      const weekKey = String(row.snapshot_week);
      const weekEntry = weekMap.get(weekKey) ?? { answered: 0, weightedAccuracy: 0 };
      weekEntry.answered += answered;
      weekEntry.weightedAccuracy += acc * answered;
      weekMap.set(weekKey, weekEntry);
    }

    const byTopic = Array.from(topicMap.entries())
      .map(([topic, value]) => ({
        topic,
        answered: value.answered,
        accuracy: value.answered ? Number((value.weightedAccuracy / value.answered).toFixed(2)) : 0,
        avg_time_seconds: value.answered ? Number((value.totalTime / value.answered).toFixed(2)) : 0
      }))
      .sort((a, b) => b.answered - a.answered);

    const weeklyTrend = Array.from(weekMap.entries())
      .map(([week_start, value]) => ({
        week_start,
        answered: value.answered,
        accuracy: value.answered ? Number((value.weightedAccuracy / value.answered).toFixed(2)) : 0
      }))
      .sort((a, b) => (a.week_start < b.week_start ? -1 : 1));

    const response: ProgressSummaryResponse = {
      mode: "authenticated",
      overall,
      by_topic: byTopic,
      weekly_trend: weeklyTrend
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
