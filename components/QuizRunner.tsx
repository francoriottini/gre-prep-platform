"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { authFetch } from "@/lib/api-client";
import { appendGuestAttempt } from "@/lib/local-progress";
import type { GenerateQuizResponse, SubmitAttemptResponse } from "@/lib/types";

const ACTIVE_QUIZ_KEY = "gre_latam_active_quiz_v1";
const LAST_RESULT_KEY = "gre_latam_last_result_v1";

function formatSeconds(total: number): string {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function QuizRunner() {
  const router = useRouter();
  const { tr } = useI18n();
  const [quiz, setQuiz] = useState<GenerateQuizResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeByQuestion, setTimeByQuestion] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    const raw = window.sessionStorage.getItem(ACTIVE_QUIZ_KEY);
    if (!raw) {
      setError("No active quiz found. Generate a quiz first.");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as GenerateQuizResponse;
      setQuiz(parsed);
      setSecondsRemaining(parsed.time_limit * 60);
      startedAtRef.current = Date.now();
    } catch {
      setError("Failed to load quiz session.");
    }
  }, []);

  useEffect(() => {
    if (!quiz || isSubmitting) {
      return;
    }
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [quiz, isSubmitting]);

  const current = useMemo(() => (quiz ? quiz.questions[index] : null), [quiz, index]);

  const captureTimeForCurrentQuestion = () => {
    if (!quiz || !current) {
      return;
    }
    const now = Date.now();
    const delta = Math.max(0, Math.round((now - startedAtRef.current) / 1000));
    setTimeByQuestion((prev) => ({
      ...prev,
      [current.id]: (prev[current.id] ?? 0) + delta
    }));
    startedAtRef.current = now;
  };

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [index]);

  const handleAnswer = (value: string) => {
    if (!current) {
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [current.id]: value
    }));
  };

  const handleSubmit = useCallback(
    async (forcedByTimer = false) => {
      if (!quiz || !current) {
        return;
      }

      const now = Date.now();
      const delta = Math.max(0, Math.round((now - startedAtRef.current) / 1000));
      const effectiveTimeByQuestion = {
        ...timeByQuestion,
        [current.id]: (timeByQuestion[current.id] ?? 0) + delta
      };
      setTimeByQuestion(effectiveTimeByQuestion);
      startedAtRef.current = now;

      setIsSubmitting(true);
      setError(null);

      try {
        const payloadAnswers = quiz.questions.map((question) => ({
          question_id: question.id,
          selected_choice: answers[question.id] ?? (forcedByTimer ? "A" : ""),
          time_spent_seconds: Math.max(0, Math.round(effectiveTimeByQuestion[question.id] ?? 0))
        }));

        const unanswered = payloadAnswers.filter((item) => !item.selected_choice);
        if (unanswered.length) {
          throw new Error("Please answer every question before submitting.");
        }

        const response = await authFetch("/api/attempt/submit", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            quiz_id: quiz.quiz_id,
            section: "quant",
            time_limit_seconds: quiz.time_limit * 60,
            requested_filters: quiz.requested_filters,
            answers: payloadAnswers
          })
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to submit attempt.");
        }

        const result = (await response.json()) as SubmitAttemptResponse;
        window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));

        if (!result.saved) {
          appendGuestAttempt({
            submitted_at: new Date().toISOString(),
            accuracy: result.summary.accuracy,
            avg_time_seconds: result.summary.avg_time_seconds,
            items: result.results.map((item) => ({
              topic: item.topic,
              subtopic: item.subtopic,
              is_correct: item.is_correct,
              time_spent_seconds: item.time_spent_seconds
            }))
          });
        }

        router.push("/results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
        setIsSubmitting(false);
      }
    },
    [answers, current, quiz, router, timeByQuestion]
  );

  useEffect(() => {
    if (secondsRemaining === 0 && quiz && !isSubmitting) {
      void handleSubmit(true);
    }
  }, [secondsRemaining, quiz, isSubmitting, handleSubmit]);

  if (error && !quiz) {
    return (
      <section className="card">
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!quiz || !current) {
    return (
      <section className="card">
        <p>Loading quiz...</p>
      </section>
    );
  }

  return (
    <section className="card stack">
      <div className="row-between">
        <strong>
          Question {index + 1} / {quiz.questions.length}
        </strong>
        <span>
          {tr("timeRemaining")}: {formatSeconds(secondsRemaining)}
        </span>
      </div>

      <p className="question-stem">{current.stem}</p>

      <div className="stack">
        {Object.entries(current.choices).map(([choiceKey, text]) => (
          <label key={choiceKey} className="choice">
            <input
              type="radio"
              name={`q-${current.id}`}
              value={choiceKey}
              checked={answers[current.id] === choiceKey}
              onChange={() => handleAnswer(choiceKey)}
            />
            <span>
              {choiceKey}. {text}
            </span>
          </label>
        ))}
      </div>

      <div className="row-between">
        <button
          type="button"
          className="button"
          disabled={index === 0}
          onClick={() => {
            captureTimeForCurrentQuestion();
            setIndex((prev) => Math.max(0, prev - 1));
          }}
        >
          {tr("previousQuestion")}
        </button>
        {index < quiz.questions.length - 1 ? (
          <button
            type="button"
            className="button"
            onClick={() => {
              captureTimeForCurrentQuestion();
              setIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1));
            }}
          >
            {tr("nextQuestion")}
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={() => void handleSubmit(false)}
            disabled={isSubmitting}
          >
            {tr("finishQuiz")}
          </button>
        )}
      </div>

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
