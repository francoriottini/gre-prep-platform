import type { QuizQuestion } from "@/lib/types";

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sampleQuestions(questions: QuizQuestion[], n: number): QuizQuestion[] {
  if (questions.length <= n) {
    return shuffle(questions);
  }
  return shuffle(questions).slice(0, n);
}

export function toWeekStart(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const delta = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function safeAverage(total: number, count: number): number {
  if (!count) {
    return 0;
  }
  return Number((total / count).toFixed(2));
}
