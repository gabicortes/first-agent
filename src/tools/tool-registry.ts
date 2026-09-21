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

import {
  executeUpdateUserProfile,
  updateUserProfileTool,
} from "@/tools/user-profile.tool";

export type ToolContext = {
  userId: string;
};

type ToolDefinition = {
  declaration: Interactions.Function;
  execute: (
    args: unknown,
    context: ToolContext,
  ) => unknown | Promise<unknown>;
};

const proteinTool: ToolDefinition = {
  declaration: calculateProteinTool,

  execute: (args) => {
    const validatedArgs =
      calculateProteinSchema.parse(args);

    return {
      proteinGramsPerDay:
        calculateProtein(validatedArgs),
    };
  },
};

const caloriesTool: ToolDefinition = {
  declaration: calculateCaloriesTool,

  execute: (args) => {
    const validatedArgs =
      calculateCaloriesSchema.parse(args);

    return {
      caloriesPerDay:
        calculateCalories(validatedArgs),
    };
  },
};

const userProfileTool: ToolDefinition = {
  declaration: updateUserProfileTool,

  execute: (args, context) => {
    return executeUpdateUserProfile(
      args,
      context.userId,
    );
  },
};

export const toolRegistry: Record<
  string,
  ToolDefinition
> = {
  calculate_protein: proteinTool,
  calculate_calories: caloriesTool,
  update_user_profile: userProfileTool,
};

export const toolDeclarations: Interactions.Tool[] =
  Object.values(toolRegistry).map(
    (tool) => tool.declaration,
  );

export async function executeTool(
  name: string,
  args: unknown,
  context: ToolContext,
) {
  const tool = toolRegistry[name];

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool.execute(args, context);
}