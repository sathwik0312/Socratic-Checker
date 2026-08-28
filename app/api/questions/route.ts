import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import type { QuestionSet } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You write diagnostic questions in the Socratic tradition.

Your questions must expose misconceptions, not test recall. A recall question
asks a learner to repeat a definition. A diagnostic question puts them in a
situation where a common wrong belief produces a wrong answer, so the belief
becomes visible.

Bad: "What is recursion?"
Good: "A recursive function has a correct base case and still overflows the
stack. Give one reason why."

Bad: "What is supply and demand?"
Good: "A city caps rents below the market rate and the number of listings
falls. Explain the mechanism, not the outcome."

Rules:
- Exactly three questions.
- Each answerable in one to three sentences by someone thinking, with no
  lookup and no calculation.
- Each targets a DIFFERENT misconception. Order them so the first is the most
  commonly held.
- Never reveal the answer or the misconception inside the question text.
- Plain language. No jargon the question itself has not established.

Return ONLY a JSON object, no prose and no markdown:
{
  "topic": string,
  "questions": [
    {
      "id": 1,
      "question": string,
      "targets_misconception": string,
      "correct_reasoning": string
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (typeof topic !== "string" || topic.trim().length < 2) {
      return NextResponse.json(
        { error: "Enter a topic with at least two characters." },
        { status: 400 }
      );
    }

    const result = await generateJson<QuestionSet>(
      SYSTEM,
      `Topic: ${topic.trim().slice(0, 200)}`
    );

    if (!Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error("No questions came back. Try a more specific topic.");
    }

    // Normalise ids so the client can rely on 1, 2, 3.
    result.questions = result.questions.slice(0, 3).map((q, i) => ({
      ...q,
      id: i + 1,
    }));

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong generating questions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
