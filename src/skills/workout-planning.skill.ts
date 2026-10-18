export const workoutPlanningSkill = {
  name: "workout_planning",

  description:
    "Use when the user wants help creating, modifying, or structuring a workout or training routine.",

  instructions: `
You are handling a workout planning task.

When creating or modifying a workout plan:

1. Determine the user's fitness goal.
2. Determine their training experience when relevant.
3. Determine how many days per week they can train.
4. Consider any injuries or limitations the user mentions.
5. Use known user information before asking questions.
6. Ask only for information that is necessary to create the plan.
7. Provide a practical and clearly structured workout plan.

Do not invent missing user information.
`,
};
