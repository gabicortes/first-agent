import { Message } from "@/types/message";
import { calculateProtein } from "@/tools/protein.tool";
import { extractWeight, toKilograms } from "@/tools/weight.tool";
import { ai } from "@/lib/ai";
import { COACH_PROMPT } from "@/prompts/coach";

const MODEL = "gemini-flash-lite-latest";

export async function generateResponse(
  messages: Message[],
): Promise<string> {
  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const isProteinQuestion = lastMessage.content
    .toLowerCase()
    .includes("protein");

  if (isProteinQuestion) {
    const weightMessage = messages
      .toReversed()
      .find(
        (message) =>
          message.role === "user" &&
          extractWeight(message.content) !== null,
      );

    if (weightMessage) {
      const weight = extractWeight(weightMessage.content);

      if (weight) {
        const weightKg = toKilograms(weight);
        const protein = calculateProtein(weightKg);

        const toolContext = `
          The protein calculator returned ${protein} grams of protein per day
          for a body weight of ${weightKg.toFixed(1)} kg.

          Use this result when answering the user.
          `;

        const response = await ai.models.generateContent({
          model: MODEL,
          contents: [
            ...contents,
            {
              role: "user",
              parts: [
                {
                  text: toolContext,
                },
              ],
            },
          ],
          config: {
            systemInstruction: COACH_PROMPT,
          },
        });

        return response.text ?? "";
      }
    }
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: COACH_PROMPT,
    },
  });

  return response.text ?? "";
}
