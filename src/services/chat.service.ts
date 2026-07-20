import { ai } from "@/lib/ai";

const MODEL = "gemini-flash-latest";

export async function generateResponse(message: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: message,
  });

  return response.text ?? "";
}
