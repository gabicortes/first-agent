import { nutritionPlanningSkill } from "@/skills/nutrition-planning.skill";

export type Skill = {
  name: string;
  description: string;
  instructions: string;
};

export const skillRegistry: Record<string, Skill> = {
  nutrition_planning: nutritionPlanningSkill,
};

export function getSkill(name: string): Skill | undefined {
  return skillRegistry[name];
}

export const skillDescriptions = Object.values(
    skillRegistry,
  ).map((skill) => ({
    name: skill.name,
    description: skill.description,
  }));