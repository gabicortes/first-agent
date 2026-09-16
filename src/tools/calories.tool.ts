import { z } from "zod";

export const calculateCaloriesSchema = z.object({
  weightKg: z.number().positive(),

  activityLevel: z.enum([
    "low",
    "moderate",
    "high",
  ]),

  goal: z.enum([
    "lose",
    "maintain",
    "gain",
  ]),
});

export type CalculateCaloriesInput = z.infer<
  typeof calculateCaloriesSchema
>;

export function calculateCalories({
  weightKg,
  activityLevel,
  goal,
}: CalculateCaloriesInput): number {
  const activityMultiplier = {
    low: 30,
    moderate: 33,
    high: 36,
  }[activityLevel];

  let calories = weightKg * activityMultiplier;

  if (goal === "lose") {
    calories -= 300;
  }

  if (goal === "gain") {
    calories += 250;
  }

  return Math.round(calories);
}

export const calculateCaloriesTool = {
  type: "function",
  name: "calculate_calories",
  description:
    "Estimates daily calorie intake from body weight, activity level, and goal.",
  parameters: {
    type: "object",
    properties: {
      weightKg: {
        type: "number",
        description: "Body weight in kilograms",
      },
      activityLevel: {
        type: "string",
        enum: ["low", "moderate", "high"],
        description: "User's general activity level",
      },
      goal: {
        type: "string",
        enum: ["lose", "maintain", "gain"],
        description:
          "Whether the user wants to lose, maintain, or gain weight",
      },
    },
    required: [
      "weightKg",
      "activityLevel",
      "goal",
    ],
  },
} as const;