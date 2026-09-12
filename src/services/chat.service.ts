import { Message } from "@/types/message";
import { ai } from "@/lib/ai";
import { COACH_PROMPT } from "@/prompts/coach";
import {
  calculateProtein,
  calculateProteinTool,
} from "@/tools/protein.tool";

const MODEL = "gemini-flash-lite-latest";

export async function generateResponse(
  messages: Message[],
): Promise<string> {
  const conversation = messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: conversation,
    system_instruction: COACH_PROMPT,
    tools: [calculateProteinTool],
  });

  const functionCall = interaction.steps?.find(
    (step) => step.type === "function_call",
  );

  // No tool needed → return Gemini's normal answer
  if (!functionCall) {
    return interaction.output_text ?? "";
  }

  // Gemini requested our protein tool
  if (functionCall.name === "calculate_protein") {
    const weightKg = Number(functionCall.arguments.weightKg);

    console.log("Gemini requested:", {
      name: functionCall.name,
      arguments: functionCall.arguments,
    });

    const protein = calculateProtein(weightKg);

    console.log("Tool result:", protein);

    const finalInteraction = await ai.interactions.create({
      model: MODEL,
      previous_interaction_id: interaction.id,
      tools: [calculateProteinTool],
      input: [
        {
          type: "function_result",
          name: functionCall.name,
          call_id: functionCall.id,
          result: [
            {
              type: "text",
              text: JSON.stringify({
                proteinGramsPerDay: protein,
              }),
            },
          ],
        },
      ],
    });

    return finalInteraction.output_text ?? "";
  }

  throw new Error(`Unknown tool requested: ${functionCall.name}`);
}