import { Interactions } from "@google/genai";

import {
  calculateProtein,
  calculateProteinSchema,
  calculateProteinTool,
} from "@/tools/protein.tool";

import {
  calculateCalories,
  calculateCaloriesSchema,
  calculateCaloriesTool,
} from "@/tools/calories.tool";

type ToolDefinition = {
  declaration: Interactions.Function;
  execute: (args: unknown) => unknown | Promise<unknown>;
};

const proteinTool: ToolDefinition = {
  declaration: calculateProteinTool,

  execute: (args) => {
    const validatedArgs = calculateProteinSchema.parse(args);

    return {
      proteinGramsPerDay: calculateProtein(validatedArgs),
    };
  },
};

const caloriesTool: ToolDefinition = {
  declaration: calculateCaloriesTool,

  execute: (args) => {
    const validatedArgs = calculateCaloriesSchema.parse(args);

    return {
      caloriesPerDay: calculateCalories(validatedArgs),
    };
  },
};

export const toolRegistry: Record<string, ToolDefinition> = {
  calculate_protein: proteinTool,
  calculate_calories: caloriesTool,
};

export const toolDeclarations: Interactions.Tool[] =
  Object.values(toolRegistry).map(
    (tool) => tool.declaration,
  );

export async function executeTool(
  name: string,
  args: unknown,
) {
  const tool = toolRegistry[name];

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool.execute(args);
}