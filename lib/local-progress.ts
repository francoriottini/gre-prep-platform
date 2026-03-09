"use client";

const STORAGE_KEY = "gre_latam_guest_progress_v1";

export interface GuestAttemptItem {
  topic: string;
  subtopic: string;
  is_correct: boolean;
  time_spent_seconds: number;
}

export interface GuestAttempt {
  submitted_at: string;
  accuracy: number;
  avg_time_seconds: number;
  items: GuestAttemptItem[];
}

interface GuestProgressStore {
  version: 1;
  attempts: GuestAttempt[];
}

function defaultStore(): GuestProgressStore {
  return { version: 1, attempts: [] };
}

export function readGuestProgress(): GuestProgressStore {
  if (typeof window === "undefined") {
    return defaultStore();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStore();
    }
    const parsed = JSON.parse(raw) as GuestProgressStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.attempts)) {
      return defaultStore();
    }
    return parsed;
  } catch {
    return defaultStore();
  }
}

export function appendGuestAttempt(attempt: GuestAttempt): void {
  if (typeof window === "undefined") {
    return;
  }
  const store = readGuestProgress();
  const attempts = [...store.attempts, attempt].slice(-200);
  const nextStore: GuestProgressStore = { version: 1, attempts };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
}

export function summarizeGuestProgress() {
  const store = readGuestProgress();
  const attempts = store.attempts;
  if (!attempts.length) {
    return {
      mode: "guest" as const,
      overall: { attempts: 0, accuracy: 0, avg_time_seconds: 0 },
      by_topic: [] as Array<{ topic: string; answered: number; accuracy: number; avg_time_seconds: number }>
    };
  }

  let accuracyTotal = 0;
  let timeTotal = 0;
  const topicMap = new Map<string, { answered: number; correct: number; totalTime: number }>();

  for (const attempt of attempts) {
    accuracyTotal += attempt.accuracy;
    timeTotal += attempt.avg_time_seconds;
    for (const item of attempt.items) {
      const prev = topicMap.get(item.topic) ?? { answered: 0, correct: 0, totalTime: 0 };
      prev.answered += 1;
      prev.correct += item.is_correct ? 1 : 0;
      prev.totalTime += item.time_spent_seconds;
      topicMap.set(item.topic, prev);
    }
  }

  const byTopic = Array.from(topicMap.entries()).map(([topic, value]) => ({
    topic,
    answered: value.answered,
    accuracy: value.answered ? Number(((value.correct / value.answered) * 100).toFixed(2)) : 0,
    avg_time_seconds: value.answered ? Number((value.totalTime / value.answered).toFixed(2)) : 0
  }));

  return {
    mode: "guest" as const,
    overall: {
      attempts: attempts.length,
      accuracy: Number((accuracyTotal / attempts.length).toFixed(2)),
      avg_time_seconds: Number((timeTotal / attempts.length).toFixed(2))
    },
    by_topic: byTopic
  };
}
