import { Message } from "@/types/message";

import { ai } from "@/lib/ai";
import { COACH_PROMPT } from "@/prompts/coach";

import {
  executeTool,
  toolDeclarations,
} from "@/tools/tool-registry";

const MODEL = "gemini-flash-lite-latest";

export async function generateResponse(
  messages: Message[],
): Promise<string> {
  const conversation = messages
    .map(
      (message) =>
        `${message.role}: ${message.content}`,
    )
    .join("\n");

  let interaction = await ai.interactions.create({
    model: MODEL,
    input: conversation,
    system_instruction: COACH_PROMPT,
    tools: toolDeclarations,
  });

  while (true) {
    const functionCalls =
      interaction.steps?.filter(
        (step) => step.type === "function_call",
      ) ?? [];

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
      );

      console.log("Tool result:", result);

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
      tools: toolDeclarations,
      input: toolResults,
    });
  }
}