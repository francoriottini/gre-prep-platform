"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { authFetch } from "@/lib/api-client";
import type { GenerateQuizResponse } from "@/lib/types";

const topicOptions = [
  "Arithmetic",
  "Algebra",
  "Geometry",
  "Data Analysis",
  "Word Problems"
] as const;

const difficultyOptions = [1, 2, 3, 4, 5] as const;

const ACTIVE_QUIZ_KEY = "gre_latam_active_quiz_v1";

export function QuizBuilder() {
  const router = useRouter();
  const { tr } = useI18n();
  const [topic, setTopic] = useState<string>("");
  const [subtopicRaw, setSubtopicRaw] = useState<string>("");
  const [difficulties, setDifficulties] = useState<number[]>([1, 2, 3]);
  const [nQuestions, setNQuestions] = useState<number>(10);
  const [timeLimit, setTimeLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDifficulty = (value: number) => {
    setDifficulties((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value].sort()
    );
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const subtopic = subtopicRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await authFetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          section: "quant",
          topic: topic || undefined,
          subtopic: subtopic.length ? subtopic : undefined,
          difficulty: difficulties.length ? difficulties : undefined,
          n_questions: nQuestions,
          time_limit: timeLimit
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to generate quiz.");
      }

      const quiz = (await response.json()) as GenerateQuizResponse;
      window.sessionStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(quiz));
      router.push("/quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>{tr("generateQuiz")}</h2>
      <form onSubmit={onSubmit} className="stack">
        <label>
          <span>{tr("topic")}</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">All topics</option>
            {topicOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{tr("subtopic")}</span>
          <input
            value={subtopicRaw}
            onChange={(e) => setSubtopicRaw(e.target.value)}
            placeholder="e.g. Ratios, Exponents"
          />
        </label>

        <fieldset className="stack">
          <legend>{tr("difficulty")}</legend>
          <div className="inline-wrap">
            {difficultyOptions.map((value) => (
              <label key={value} className="checkbox">
                <input
                  type="checkbox"
                  checked={difficulties.includes(value)}
                  onChange={() => toggleDifficulty(value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span>{tr("numberOfQuestions")}</span>
          <input
            type="number"
            min={5}
            max={40}
            value={nQuestions}
            onChange={(e) => setNQuestions(Number(e.target.value))}
          />
        </label>

        <label>
          <span>{tr("timeLimit")}</span>
          <input
            type="number"
            min={5}
            max={180}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
        </label>

        <button type="submit" className="button button-primary" disabled={isLoading}>
          {isLoading ? "..." : tr("startQuiz")}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
