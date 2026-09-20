export type UserProfile = {
    name?: string;
    weightKg?: number;
    activityLevel?: "low" | "moderate" | "high";
    goal?: "lose" | "maintain" | "gain";
    language?: "en" | "es";
  };