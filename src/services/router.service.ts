import { Message } from "@/types/message";

import { ai } from "@/lib/ai";
import { skillDescriptions } from "@/skills/skill-registry";

const MODEL = "gemini-flash-lite-latest";

export async function routeSkill(messages: Message[]): Promise<string> {
  const conversation = messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  const availableSkills = skillDescriptions
    .map((skill) => `${skill.name}: ${skill.description}`)
    .join("\n");

  const response = await ai.models.generateContent({
    model: MODEL,

    contents: `
Conversation:
${conversation}

Available skills:
${availableSkills}
`,

    config: {
      systemInstruction: `
You are a routing system.

Your only job is to determine which skill is most appropriate
for the user's current request.

Return exactly one skill name from the available skills.

If none of the available skills are appropriate, return:
general

Do not answer the user's question.
Do not explain your decision.
`,
    },
  });

  console.log("Router result:", response.text);
  return response.text?.trim() ?? "general";
}
