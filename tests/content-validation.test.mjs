import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
  loadQuestionBank,
  validateQuestionBank
} from "../scripts/question-bank-utils.mjs";

test("sample question bank validates", () => {
  const filePath = path.resolve(process.cwd(), "content/questions.quant.sample.json");
  const bank = loadQuestionBank(filePath);
  const result = validateQuestionBank(bank);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("invalid item is detected", () => {
  const invalidBank = [
    {
      section: "quant",
      topic: "Arithmetic",
      subtopic: "Ratios",
      difficulty: 7,
      stem: "Broken question",
      choices: { A: "1", B: "2" },
      correct_choice: "E",
      explanation_en: "x",
      explanation_es: "x",
      source_type: "original",
      status: "published"
    }
  ];

  const result = validateQuestionBank(invalidBank);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});
