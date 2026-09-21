import { z } from "zod";
import { prisma } from "../../prisma";


export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  weightKg: z.number().positive().optional(),
  activityLevel: z
    .enum(["low", "moderate", "high"])
    .optional(),
  goal: z
    .enum(["lose", "maintain", "gain"])
    .optional(),
  language: z.enum(["en", "es"]).optional(),
});

export const updateUserProfileTool = {
  type: "function",
  name: "update_user_profile",
  description:
    "Stores profile information explicitly provided by the user. Use it when the user provides or changes their name, weight, activity level, fitness goal, or preferred language.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The user's name",
      },
      weightKg: {
        type: "number",
        description: "The user's body weight in kilograms",
      },
      activityLevel: {
        type: "string",
        enum: ["low", "moderate", "high"],
      },
      goal: {
        type: "string",
        enum: ["lose", "maintain", "gain"],
      },
      language: {
        type: "string",
        enum: ["en", "es"],
      },
    },
  },
} as const;

export async function executeUpdateUserProfile(
  args: unknown,
  userId: string,
) {
  const data = updateUserProfileSchema.parse(args);

  const profile = await prisma.userProfile.upsert({
    where: {
      userId,
    },

    update: data,

    create: {
      userId,
      ...data,
    },
  });

  return profile;
}