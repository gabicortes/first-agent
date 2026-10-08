export const nutritionPlanningSkill = {
    name: "nutrition_planning",
  
    description:
      "Use when the user wants help determining nutrition targets, such as calories or protein, or wants a nutrition plan related to their fitness goal.",
  
    instructions: `
  You are handling a nutrition planning task.
  
  Use known user profile information before asking the user for information.
  
  For nutrition targets:
  
  1. Determine the user's fitness goal.
  2. Determine their weight.
  3. Determine their activity level when calorie calculations are needed.
  4. Ask only for information that is actually missing.
  5. Use the available calculation tools instead of estimating values yourself.
  6. Explain the resulting targets clearly and practically.
  
  Do not invent missing user information.
  `,
  };