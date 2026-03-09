import { z } from "zod";

export const generateQuizSchema = z.object({
  section: z.literal("quant").default("quant"),
  topic: z.string().trim().min(1).max(120).optional(),
  subtopic: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  difficulty: z.array(z.number().int().min(1).max(5)).max(5).optional(),
  n_questions: z.number().int().min(5).max(40),
  time_limit: z.number().int().min(5).max(180)
});

export const submitAttemptSchema = z.object({
  quiz_id: z.string().uuid(),
  section: z.literal("quant"),
  time_limit_seconds: z.number().int().min(60).max(10800),
  requested_filters: z.object({
    topic: z.string().optional(),
    subtopic: z.array(z.string()).optional(),
    difficulty: z.array(z.number().int().min(1).max(5)).optional(),
    n_questions: z.number().int().min(5).max(40),
    time_limit: z.number().int().min(5).max(180)
  }),
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid(),
        selected_choice: z.string().regex(/^[A-E]$/),
        time_spent_seconds: z.number().int().min(0).max(7200)
      })
    )
    .min(1)
    .max(40)
});

export const itemFeedbackSchema = z.object({
  question_id: z.string().uuid(),
  attempt_id: z.string().uuid().optional().nullable(),
  feedback_type: z.enum(["error", "ambiguous", "too_easy", "too_hard", "other"]),
  comment: z.string().trim().max(1000).optional().nullable(),
  difficulty_vote: z.number().int().min(1).max(5).optional().nullable()
});

export const questionBankItemSchema = z.object({
  section: z.literal("quant"),
  topic: z.string().trim().min(1).max(120),
  subtopic: z.string().trim().min(1).max(120),
  difficulty: z.number().int().min(1).max(5),
  stem: z.string().trim().min(10).max(2000),
  choices: z.record(z.string().regex(/^[A-E]$/), z.string().trim().min(1).max(1000)),
  correct_choice: z.string().regex(/^[A-E]$/),
  explanation_en: z.string().trim().min(5).max(4000),
  explanation_es: z.string().trim().min(5).max(4000),
  source_type: z.literal("original"),
  status: z.enum(["draft", "reviewed", "published"]),
  reviewer_1: z.string().uuid().nullable().optional(),
  reviewer_2: z.string().uuid().nullable().optional(),
  quality_flags: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().default({})
});

export const questionBankSchema = z.array(questionBankItemSchema);
