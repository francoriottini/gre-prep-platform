import {
  loadQuestionBank,
  resolveInputPath,
  summarizeQuestionBank,
  validateQuestionBank
} from "./question-bank-utils.mjs";

const fileArg = process.argv[2] ?? "content/questions.quant.sample.json";
const inputPath = resolveInputPath(fileArg);

try {
  const questionBank = loadQuestionBank(inputPath);
  const validation = validateQuestionBank(questionBank);

  if (!validation.valid) {
    console.error(`Validation failed for ${inputPath}`);
    for (const err of validation.errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  const summary = summarizeQuestionBank(questionBank);
  console.log(`Validation successful: ${inputPath}`);
  console.log(`Total questions: ${summary.total}`);
  console.log("By topic:");
  for (const [topic, count] of Object.entries(summary.byTopic)) {
    console.log(`- ${topic}: ${count}`);
  }
} catch (error) {
  console.error(`Validation crashed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
