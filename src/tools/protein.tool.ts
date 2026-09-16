import { z } from "zod";

export const calculateProteinSchema = z.object({
  weightKg: z.number().positive(),
});

export type CalculateProteinInput = z.infer<
  typeof calculateProteinSchema
>;

export function calculateProtein({
  weightKg,
}: CalculateProteinInput): number {
  return weightKg * 2;
}

export const calculateProteinTool = {
  type: "function",
  name: "calculate_protein",
  description:
    "Calculates a daily protein target in grams from body weight in kilograms.",
  parameters: {
    type: "object",
    properties: {
      weightKg: {
        type: "number",
        description: "Body weight in kilograms",
      },
    },
    required: ["weightKg"],
  },
} as const;