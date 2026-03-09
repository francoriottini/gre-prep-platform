"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { authFetch } from "@/lib/api-client";
import type { SubmitAttemptResponse } from "@/lib/types";

const LAST_RESULT_KEY = "gre_latam_last_result_v1";

type FeedbackDraft = {
  feedback_type: "error" | "ambiguous" | "too_easy" | "too_hard" | "other";
  comment: string;
  difficulty_vote: string;
};

const defaultDraft: FeedbackDraft = {
  feedback_type: "other",
  comment: "",
  difficulty_vote: ""
};

export function ResultsReview() {
  const { language, tr } = useI18n();
  const [result, setResult] = useState<SubmitAttemptResponse | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, FeedbackDraft>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
    if (!raw) {
      setError("No results found. Complete a quiz first.");
      return;
    }
    try {
      setResult(JSON.parse(raw) as SubmitAttemptResponse);
    } catch {
      setError("Failed to parse results.");
    }
  }, []);

  const summaryText = useMemo(() => {
    if (!result) {
      return null;
    }
    return `${result.summary.correct_answers}/${result.summary.total_questions} • ${tr("accuracy")}: ${result.summary.accuracy}% • ${tr("avgTime")}: ${result.summary.avg_time_seconds}s`;
  }, [result, tr]);

  const getDraft = (questionId: string): FeedbackDraft => feedbackDrafts[questionId] ?? defaultDraft;

  const updateDraft = (questionId: string, patch: Partial<FeedbackDraft>) => {
    setFeedbackDrafts((prev) => ({
      ...prev,
      [questionId]: {
        ...getDraft(questionId),
        ...patch
      }
    }));
  };

  const sendFeedback = async (questionId: string) => {
    if (!result) {
      return;
    }
    const draft = getDraft(questionId);
    const vote = draft.difficulty_vote ? Number(draft.difficulty_vote) : null;

    const response = await authFetch("/api/item-feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question_id: questionId,
        attempt_id: result.attempt_id,
        feedback_type: draft.feedback_type,
        comment: draft.comment || null,
        difficulty_vote: Number.isInteger(vote) ? vote : null
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "Failed to send feedback");
    }
    setSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  if (error) {
    return (
      <section className="card">
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="card">
        <p>Loading results...</p>
      </section>
    );
  }

  return (
    <section className="stack">
      <article className="card">
        <h2>{tr("reviewAnswers")}</h2>
        <p>{summaryText}</p>
        <p>{result.saved ? tr("remoteProgressNotice") : tr("localProgressNotice")}</p>
      </article>

      {result.results.map((item) => {
        const draft = getDraft(item.question_id);
        const isSubmitted = Boolean(submitted[item.question_id]);

        return (
          <article key={item.question_id} className="card stack">
            <div className="row-between">
              <strong>
                {item.topic} / {item.subtopic}
              </strong>
              <span className={item.is_correct ? "ok" : "error"}>
                {item.is_correct ? tr("correct") : tr("incorrect")}
              </span>
            </div>
            <p>
              {tr("choice")}: {item.selected_choice} | {tr("correct")}: {item.correct_choice}
            </p>
            <p>
              <strong>{tr("explanation")}:</strong>{" "}
              {language === "es" ? item.explanation_es : item.explanation_en}
            </p>

            <div className="feedback-box stack">
              <label>
                <span>{tr("feedback")}</span>
                <select
                  value={draft.feedback_type}
                  onChange={(e) =>
                    updateDraft(item.question_id, {
                      feedback_type: e.target.value as FeedbackDraft["feedback_type"]
                    })
                  }
                >
                  <option value="other">Other</option>
                  <option value="error">Error</option>
                  <option value="ambiguous">Ambiguous</option>
                  <option value="too_easy">Too easy</option>
                  <option value="too_hard">Too hard</option>
                </select>
              </label>

              <label>
                <span>Comment</span>
                <textarea
                  rows={2}
                  value={draft.comment}
                  onChange={(e) => updateDraft(item.question_id, { comment: e.target.value })}
                />
              </label>

              <label>
                <span>Difficulty vote (1-5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={draft.difficulty_vote}
                  onChange={(e) => updateDraft(item.question_id, { difficulty_vote: e.target.value })}
                />
              </label>

              <button
                type="button"
                className="button"
                disabled={isSubmitted}
                onClick={async () => {
                  try {
                    await sendFeedback(item.question_id);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Unexpected feedback error");
                  }
                }}
              >
                {isSubmitted ? "Sent" : "Send feedback"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
