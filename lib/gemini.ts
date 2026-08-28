const MODEL = "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Gemini occasionally wraps JSON in markdown fences despite the response
 * mime type. Strip them before parsing rather than trusting the model.
 */
function stripFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

export async function generateJson<T>(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7
): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it in your environment panel and redeploy."
    );
  }

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini returned ${res.status}. ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no content. Try rephrasing the topic.");
  }

  try {
    return JSON.parse(stripFences(text)) as T;
  } catch {
    throw new Error("Could not read the model's response as JSON. Try again.");
  }
}
