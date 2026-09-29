export const GLASS_ML = 250;

export type OnboardingAnswers = {
  ageRange: string;
  activity: string;
  currentGlasses: string;
  exercise: string;
  wakeTime: string;
  bedTime: string;
  lifeStage: string;
  temperatureC?: string;
};

export type WaterGoal = {
  recommendedMl: number;
  recommendedGlasses: number;
  currentGlassesLabel: string;
  explanation: string[];
};

export function calculateWaterGoal(answers: OnboardingAnswers): WaterGoal {
  const validAges = ["18-30", "31-50", "51-65", "65+"];
  const validCurrentGlasses = ["0-2", "3-4", "5-6", "7-8", "9+", "unsure"];

  if (!validAges.includes(answers.ageRange)) {
    throw new Error("Please select a valid age range.");
  }

  if (!validCurrentGlasses.includes(answers.currentGlasses)) {
    throw new Error("Please select your current water intake.");
  }

  // A starting tracking target, not a medical water requirement.
  let ml = 1500;
  const explanation = ["Starting target: 1,500 ml"];

  switch (answers.activity) {
    case "low":
      break;
    case "moderate":
      ml += 250;
      explanation.push("Some daily movement: +250 ml");
      break;
    case "high":
      ml += 500;
      explanation.push("On your feet most of the day: +500 ml");
      break;
    default:
      throw new Error("Please select your daily activity.");
  }

  switch (answers.exercise) {
    case "none":
      break;
    case "under-30":
      ml += 250;
      explanation.push("Exercise under 30 minutes: +250 ml");
      break;
    case "30-60":
      ml += 500;
      explanation.push("Exercise for 30–60 minutes: +500 ml");
      break;
    case "over-60":
      ml += 750;
      explanation.push("Exercise over 60 minutes: +750 ml");
      break;
    default:
      throw new Error("Please select your exercise time.");
  }

  if (answers.temperatureC?.trim()) {
    const temperature = Number(answers.temperatureC);

    if (!Number.isFinite(temperature) || temperature < -30 || temperature > 55) {
      throw new Error("Please enter a valid temperature in °C.");
    }

    if (temperature >= 30) {
      ml += 250;
      explanation.push("Hot weather: +250 ml starting adjustment");
    }
  }

  switch (answers.lifeStage) {
    case "none":
      break;
    case "pregnant":
      ml += 250;
      explanation.push("Pregnancy: +250 ml starting adjustment");
      break;
    case "breastfeeding":
      ml += 500;
      explanation.push("Breastfeeding: +500 ml starting adjustment");
      break;
    default:
      throw new Error("Please select a valid life stage.");
  }

  // Keep the suggested tracking target within this app's supported range.
  const recommendedGlasses = Math.min(12, Math.max(6, Math.round(ml / GLASS_ML)));

  return {
    recommendedGlasses,
    recommendedMl: recommendedGlasses * GLASS_ML,
    currentGlassesLabel: answers.currentGlasses,
    explanation,
  };
}
