# Content Operations

Workflow for sourcing, reviewing, and publishing original GRE Quant questions.

## Principles

- Quality over raw volume
- Legal safety first
- Clear explanations in EN + ES
- Data-driven iteration (accuracy/time/feedback)

## Intake Channels

- Internal authoring
- Trusted volunteers
- Public call on X/Twitter
- University networks and GRE communities

## Required Contributor Statement

Every external contributor must explicitly confirm:

`I confirm this question and explanation are my original work and I grant permission to publish under the project license.`

## Suggested Intake Form Fields

- Contributor name or handle
- Contact email
- Authorship statement (required checkbox)
- Question stem
- Choices A-E
- Correct choice
- Explanation EN
- Explanation ES
- Topic
- Subtopic
- Difficulty (1-5)
- Optional notes

## Review Pipeline

1. Draft: incoming item created with `status=draft`
2. Review 1: quality + math correctness
3. Review 2: clarity + language quality + legal sanity
4. Publish: set `status=published`

Reject criteria:

- copied or derivative copyrighted content
- ambiguous/multiple valid answers
- weak explanation quality
- incorrect math

## Quality Checklist (per item)

- exactly one correct option
- choices are plausible distractors
- explanation explains logic, not just final answer
- EN and ES explanations are both present
- topic/subtopic/difficulty are correctly tagged

## Monitoring After Publish

Track per item:

- accuracy rate
- average solve time
- feedback reports (`error`, `ambiguous`, `too_easy`, `too_hard`)

Flag for re-review when:

- unusually low/high accuracy for given difficulty
- repeated "ambiguous" feedback
- repeated "error" feedback

## X/Twitter Outreach Template

Short post:

`Building a free GRE Quant practice platform for LatAm students. Looking for contributors who can submit ORIGINAL Quant questions in English (with EN+ES explanations). If you want to help, reply here or DM me.`

Longer thread opener:

`I am building an open-source, free GRE Quant prep tool focused on Latin America and low-income contexts. We are accepting original question contributions only (no ETS/commercial prep copied material). If you want to contribute, I can share the submission form and review process.`

## Weekly Content Cadence (recommended)

- Monday: intake triage
- Tuesday/Wednesday: review rounds
- Thursday: publish batch
- Friday: metric review + quality retro
