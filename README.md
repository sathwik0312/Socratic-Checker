# Socratic Checker

**Team:** _TEAM MEMBERS — replace before submitting_
**Brief:** DevFest DC 2026 Build-a-thon — 4.2 Socratic Checker
**Live URL:** _paste your Vercel URL here_

Socratic Checker takes a topic, writes three questions designed to expose
misconceptions rather than test recall, collects the learner's answers in free
text, and reports the single concept their understanding actually breaks on.
Where a quiz app returns a score, this returns a diagnosis: which wrong belief
each answer revealed, and one concrete thing to do about it.

## Run it locally

```bash
npm install
cp .env.example .env.local     # add your Gemini key
npm run dev                    # http://localhost:3000
```

Get a free key at [Google AI Studio](https://aistudio.google.com/apikey).

## Deploy

Push to a public GitHub repo, import it at [vercel.com/new](https://vercel.com/new),
and add `GEMINI_API_KEY` under **Settings → Environment Variables** before the
first build. No database, no auth, no other configuration.

## How it works

| Path | What it does |
| --- | --- |
| `app/page.tsx` | Holds the session in React state and moves between three phases: topic, answering, report. |
| `app/api/questions/route.ts` | Asks Gemini for three diagnostic questions, each tagged with the misconception it targets. |
| `app/api/evaluate/route.ts` | Sends the questions, their target misconceptions, and the answers back for a per-question verdict and one primary gap. |
| `lib/gemini.ts` | Single server-side Gemini call. Requests JSON, strips stray markdown fences, and throws readable errors. |
| `components/Spine.tsx` | Three nodes on a rail. Progress while answering, verdict summary on the report. |

The API key is read from `process.env` inside route handlers and never reaches
the browser.

## Scope decisions

- **Three questions, fixed.** The value is locating one gap, not grading. More
  questions make the report longer without making it sharper.
- **No accounts, no history.** Every session lives in React state. Storage would
  have cost an hour and earned nothing at the table round.
- **Free-text answers, not multiple choice.** Multiple choice cannot show you a
  learner reasoning their way into the wrong answer, which is the entire point.

## Known limits

It judges reasoning, so an unusual but valid answer can be marked partial. It
does not know a course syllabus, so "the gap" is a place to look rather than a
grade. Questions are generated live, so two runs on the same topic differ.

## What's next

Let an instructor paste a syllabus so the questions target that course's
sequence, and aggregate gaps across a class to show which misconception is
spreading.
