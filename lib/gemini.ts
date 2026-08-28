import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";

// vertexai flag comes from GOOGLE_GENAI_USE_VERTEXAI env. apiKey must be
// passed explicitly here (not left implicit) or the SDK prefers the also-set
// GOOGLE_CLOUD_PROJECT/LOCATION env vars and falls back to ADC instead of
// this Vertex AI Express-mode key.
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature,
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
    },
  });

  const text = res.text;
  if (!text) {
    throw new Error("Gemini returned no content. Try rephrasing the topic.");
  }

  try {
    return JSON.parse(stripFences(text)) as T;
  } catch {
    throw new Error("Could not read the model's response as JSON. Try again.");
  }
}
