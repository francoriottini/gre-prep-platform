export type Language = "es" | "en";

export type QuestionStatus = "draft" | "reviewed" | "published";

export type FeedbackType = "error" | "ambiguous" | "too_easy" | "too_hard" | "other";

export interface QuizQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: number;
  stem: string;
  choices: Record<string, string>;
}

export interface QuestionBankItem extends QuizQuestion {
  correct_choice: string;
  explanation_en: string;
  explanation_es: string;
  source_type: "original";
  status: QuestionStatus;
  reviewer_1: string | null;
  reviewer_2: string | null;
  quality_flags: Record<string, string | number | boolean>;
}

export interface GenerateQuizRequest {
  section: "quant";
  topic?: string;
  subtopic?: string[];
  difficulty?: number[];
  n_questions: number;
  time_limit: number;
}

export interface GenerateQuizResponse {
  quiz_id: string;
  generated_at: string;
  section: "quant";
  time_limit: number;
  requested_filters: Omit<GenerateQuizRequest, "section">;
  questions: QuizQuestion[];
}

export interface SubmittedAnswer {
  question_id: string;
  selected_choice: string;
  time_spent_seconds: number;
}

export interface SubmitAttemptRequest {
  quiz_id: string;
  section: "quant";
  time_limit_seconds: number;
  requested_filters: Omit<GenerateQuizRequest, "section">;
  answers: SubmittedAnswer[];
}

export interface SubmitAttemptResponse {
  saved: boolean;
  attempt_id: string | null;
  summary: {
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    avg_time_seconds: number;
  };
  results: Array<{
    question_id: string;
    selected_choice: string;
    correct_choice: string;
    is_correct: boolean;
    explanation_en: string;
    explanation_es: string;
    topic: string;
    subtopic: string;
    time_spent_seconds: number;
  }>;
}

export interface ProgressSummaryResponse {
  mode: "authenticated" | "guest";
  overall: {
    attempts: number;
    accuracy: number;
    avg_time_seconds: number;
  } | null;
  by_topic: Array<{
    topic: string;
    answered: number;
    accuracy: number;
    avg_time_seconds: number;
  }>;
  weekly_trend: Array<{
    week_start: string;
    answered: number;
    accuracy: number;
  }>;
}
