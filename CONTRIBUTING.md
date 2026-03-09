# Contributing

Thanks for contributing to GRE Quant Gratis.

## Ground Rules

- Keep all question content original.
- Do not submit or adapt copyrighted GRE prep material from ETS or commercial prep providers.
- Keep explanations clear and pedagogical, with EN + ES versions.

## Local Setup

```bash
npm install
npm run validate:bank
npm run test:content
npm run dev
```

## Code Contributions

1. Create a branch from `main`.
2. Make focused changes.
3. Run:
   - `npm run build`
   - `npm run validate:bank`
   - `npm run test:content`
4. Open a PR with:
   - objective
   - screenshots for UI changes
   - testing notes

## Question Contributions

Submit questions in the same structure used by `content/questions.quant.sample.json`.

Required fields:

- `section` = `quant`
- `topic`
- `subtopic`
- `difficulty` (1-5)
- `stem`
- `choices` (`A` to `E`)
- `correct_choice`
- `explanation_en`
- `explanation_es`
- `source_type` = `original`
- `status` (`draft`, `reviewed`, `published`)

Example skeleton:

```json
{
  "section": "quant",
  "topic": "Arithmetic",
  "subtopic": "Ratios",
  "difficulty": 2,
  "stem": "Question text...",
  "choices": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "...",
    "E": "..."
  },
  "correct_choice": "C",
  "explanation_en": "Explain reasoning in English.",
  "explanation_es": "Explica el razonamiento en espanol.",
  "source_type": "original",
  "status": "draft",
  "reviewer_1": null,
  "reviewer_2": null,
  "quality_flags": {}
}
```

## Social Call for Questions

When collecting questions from X/Twitter or forms, require this author statement:

`I confirm this question and explanation are my original work and I grant permission to publish under the project license.`
