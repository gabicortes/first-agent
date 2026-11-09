import { ai } from "@/lib/ai";

type GenerateConversationTitleParams = {
  userMessage: string;
  assistantResponse: string;
  language: "en" | "es";
};

export async function generateConversationTitle({
  userMessage,
  assistantResponse,
  language,
}: GenerateConversationTitleParams): Promise<string> {
  const result = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: `
Generate a concise title for a fitness coaching conversation.

Language: ${language === "es" ? "Spanish" : "English"}

User's first message:
${userMessage}

Assistant's first response:
${assistantResponse}

Rules:
- Use both messages to understand the topic.
- Write 3 to 6 words.
- Be specific and descriptive.
- Do not include quotation marks.
- Do not include emojis.
- Return only the title.
    `.trim(),
    config: {
      temperature: 0.2,
      maxOutputTokens: 60,
    },
  });

  const title = result.text?.trim();

  if (!title) {
    throw new Error("Gemini returned an empty conversation title");
  }

  return title.replace(/^["']|["']$/g, "").slice(0, 80);
}
