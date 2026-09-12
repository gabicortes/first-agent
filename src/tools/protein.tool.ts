export function extractWeight(message: string): number | null {
  const match = message.match(/\d+/);

  if (!match) {
    return null;
  }

  return Number(match[0]);
}

export function calculateProtein(weight: number): number {
    return weight * 2;
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