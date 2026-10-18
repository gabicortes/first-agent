import { Message } from "@/types/message";

import { ai } from "@/lib/ai";
import { routeSkill } from "@/services/router.service";
import { getSkill } from "@/skills/skill-registry";
import { COACH_PROMPT } from "@/prompts/coach";
import { executeTool, getToolDeclarations } from "@/tools/tool-registry";
import { prisma } from "../../prisma";

const MODEL = "gemini-flash-lite-latest";

export async function generateResponse(
  messages: Message[],
  userId: string | null,
  language: "en" | "es" = "es",
): Promise<string> {
  const userProfile = userId
    ? await prisma.userProfile.findUnique({
        where: {
          userId,
        },
      })
    : null;

  const toolContext = {
    userId,
  };

  const toolDeclarations = getToolDeclarations(toolContext);

  const skillName = await routeSkill(messages);
  const selectedSkill = getSkill(skillName);

  console.log("Selected skill:", skillName);

  const profileContext = userProfile
    ? `
        Known user profile:
        - Name: ${userProfile.name ?? "unknown"}
        - Weight: ${userProfile.weightKg ?? "unknown"} kg
        - Activity level: ${userProfile.activityLevel ?? "unknown"}
        - Goal: ${userProfile.goal ?? "unknown"}
        - Preferred language: ${userProfile.language ?? "unknown"}

        Use this information when relevant.
        Do not ask the user for information that is already known here.
      `
    : "";

  const skillContext = selectedSkill
    ? `
Active skill:
${selectedSkill.name}

Skill instructions:
${selectedSkill.instructions}
`
    : "";

  const systemInstruction = `
${COACH_PROMPT}

${profileContext}

${skillContext}

The interface language is ${language === "es" ? "Spanish" : "English"}.
Use it as the default only when no conversation language
or explicit language preference has been established.
`;

  const conversation = messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  let interaction = await ai.interactions.create({
    model: MODEL,
    input: conversation,
    system_instruction: systemInstruction,
    tools: toolDeclarations,
  });

  while (true) {
    const functionCalls =
      interaction.steps?.filter((step) => step.type === "function_call") ?? [];

    if (functionCalls.length === 0) {
      return interaction.output_text ?? "";
    }

    const toolResults = [];

    for (const functionCall of functionCalls) {
      console.log("Tool requested:", {
        name: functionCall.name,
        arguments: functionCall.arguments,
      });

      const result = await executeTool(
        functionCall.name,
        functionCall.arguments,
        toolContext,
      );

      toolResults.push({
        type: "function_result" as const,
        name: functionCall.name,
        call_id: functionCall.id,
        result: [
          {
            type: "text" as const,
            text: JSON.stringify(result),
          },
        ],
      });
    }

    interaction = await ai.interactions.create({
      model: MODEL,
      previous_interaction_id: interaction.id,
      system_instruction: systemInstruction,
      tools: toolDeclarations,
      input: toolResults,
    });
  }
}
