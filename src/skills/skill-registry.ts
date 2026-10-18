import { nutritionPlanningSkill } from "@/skills/nutrition-planning.skill";
import { workoutPlanningSkill } from "@/skills/workout-planning.skill";

export type Skill = {
  name: string;
  description: string;
  instructions: string;
};

export const skillRegistry: Record<string, Skill> = {
  nutrition_planning: nutritionPlanningSkill,
  workout_planning: workoutPlanningSkill,
};

export function getSkill(name: string): Skill | undefined {
  return skillRegistry[name];
}

export const skillDescriptions = Object.values(skillRegistry).map((skill) => ({
  name: skill.name,
  description: skill.description,
}));

export function isValidSkill(name: string): name is keyof typeof skillRegistry {
  return name in skillRegistry;
}
