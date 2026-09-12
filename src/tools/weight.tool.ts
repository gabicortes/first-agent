export type Weight = {
    value: number;
    unit: "kg" | "lb";
  };
  
  export function extractWeight(message: string): Weight | null {
    const match = message.match(/(\d+(?:\.\d+)?)\s*(kg|lb)/i);
  
    if (!match) {
      return null;
    }
  
    return {
      value: Number(match[1]),
      unit: match[2].toLowerCase() as "kg" | "lb",
    };
  }

  export function toKilograms(weight: Weight): number {
    if (weight.unit === "kg") {
      return weight.value;
    }
  
    return weight.value * 0.453592;
  }