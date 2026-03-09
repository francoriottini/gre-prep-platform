import fs from "node:fs";
import path from "node:path";

const allowedStatus = new Set(["draft", "reviewed", "published"]);
const allowedChoices = new Set(["A", "B", "C", "D", "E"]);

export function resolveInputPath(fileArg = "content/questions.quant.sample.json") {
  return path.resolve(process.cwd(), fileArg);
}

export function loadQuestionBank(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Question bank must be a JSON array.");
  }
  return parsed;
}

export function validateQuestionBank(questionBank) {
  const errors = [];

  questionBank.forEach((q, index) => {
    const label = `index ${index}`;
    const requiredStringFields = [
      "section",
      "topic",
      "subtopic",
      "stem",
      "correct_choice",
      "explanation_en",
      "explanation_es",
      "source_type",
      "status"
    ];

    for (const field of requiredStringFields) {
      if (typeof q[field] !== "string" || q[field].trim().length === 0) {
        errors.push(`${label}: field '${field}' is required and must be a non-empty string.`);
      }
    }

    if (q.section !== "quant") {
      errors.push(`${label}: field 'section' must be 'quant'.`);
    }

    if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 5) {
      errors.push(`${label}: field 'difficulty' must be an integer between 1 and 5.`);
    }

    if (q.source_type !== "original") {
      errors.push(`${label}: field 'source_type' must be 'original'.`);
    }

    if (!allowedStatus.has(q.status)) {
      errors.push(`${label}: field 'status' must be draft|reviewed|published.`);
    }

    if (typeof q.choices !== "object" || q.choices === null || Array.isArray(q.choices)) {
      errors.push(`${label}: field 'choices' must be an object with keys A-E.`);
    } else {
      const keys = Object.keys(q.choices);
      for (const key of keys) {
        if (!allowedChoices.has(key)) {
          errors.push(`${label}: invalid choice key '${key}'.`);
        }
        if (typeof q.choices[key] !== "string" || q.choices[key].trim().length === 0) {
          errors.push(`${label}: choice '${key}' must have non-empty text.`);
        }
      }

      if (!allowedChoices.has(q.correct_choice)) {
        errors.push(`${label}: correct_choice must be one of A-E.`);
      } else if (!Object.prototype.hasOwnProperty.call(q.choices, q.correct_choice)) {
        errors.push(`${label}: correct_choice '${q.correct_choice}' does not exist in choices.`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function summarizeQuestionBank(questionBank) {
  const byTopic = {};
  for (const item of questionBank) {
    byTopic[item.topic] = (byTopic[item.topic] || 0) + 1;
  }
  return {
    total: questionBank.length,
    byTopic
  };
}
