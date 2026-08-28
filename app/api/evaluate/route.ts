import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import type { Report, Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You diagnose where a learner's understanding breaks.

You receive a topic, three diagnostic questions with the misconception each one
targets, and the learner's answers. Judge the REASONING, not the vocabulary. An
answer in casual words that shows the right mechanism is solid. An answer that
uses correct terminology but reverses the mechanism is a misconception.

Verdicts:
- "solid": the reasoning is right, even if informally expressed.
- "partial": the direction is right but a step is missing or hand-waved.
- "misconception": the answer relies on the wrong belief the question targeted,
  or contradicts the mechanism.

Then name ONE primary gap. This is the single concept most worth reviewing. If
every answer was solid, name the next concept that builds on this topic instead,
and say so plainly. Write it for the learner, in plain language, without jargon.

Tone: direct and useful. Never condescending, never congratulatory filler.
Address the learner as "you".

Return ONLY a JSON object, no prose and no markdown:
{
  "per_question": [
    {
      "id": number,
      "verdict": "solid" | "partial" | "misconception",
      "what_you_showed": string,
      "the_gap": string
    }
  ],
  "primary_gap": string,
  "next_step": string
}

"the_gap" is an empty string when the verdict is "solid".
"next_step" is one concrete action, not a reading list.`;

export async function POST(req: Request) {
  try {
    const { topic, questions, answers } = await req.json();

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "The session data was incomplete. Start a new topic." },
        { status: 400 }
      );
    }

    const transcript = (questions as Question[])
      .map((q, i) => {
        const answer = String(answers[i] ?? "").trim().slice(0, 1500);
        return [
          `Question ${q.id}: ${q.question}`,
          `Misconception it targets: ${q.targets_misconception}`,
          `Correct reasoning: ${q.correct_reasoning}`,
          `Learner answered: ${answer || "(left blank)"}`,
        ].join("\n");
      })
      .join("\n\n");

    const result = await generateJson<Report>(
      SYSTEM,
      `Topic: ${topic}\n\n${transcript}`,
      0.4
    );

    if (!Array.isArray(result.per_question) || !result.primary_gap) {
      throw new Error("The evaluation came back incomplete. Try again.");
    }

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong evaluating your answers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
