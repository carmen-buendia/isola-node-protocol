// packages/rule-engine/src/learner.ts

// Minimum and maximum limits to prevent rule weights from going crazy.
const MIN_WEIGHT = 0.1;
const MAX_WEIGHT = 3.0;

export interface LearningSignal {
  firedRuleIds: string[];
  /** true if the decision was correct, false if wrong, null if not yet verified. */
  correct: boolean | null;
  /** How much to adjust the weight (default: 0.05). */
  epsilon?: number;
  /** Multiplier for the adjustment (default: 2). */
  strength?: number;
}

export interface WeightState {
  ruleId: string;
  weight: number;
  timesApplied: number;
  timesCorrect: number;
  timesWrong: number;
  lastUpdatedAt: string;
}

/**
 * Ensures the weight stays within the allowed bounds.
 */
function clampWeight(value: number): number {
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, value));
}

/**
 * Returns a text label indicating if the accuracy improved, declined, or stayed the same.
 */
function getTrendText(
  currentAccuracy: number,
  previousAccuracy?: number,
): string {
  if (previousAccuracy === undefined) return "";

  if (currentAccuracy > previousAccuracy) return " (Improving)";
  if (currentAccuracy < previousAccuracy) return " (Declining)";
  return " (Stable)";
}

/**
 * Adjusts rule weights based on human feedback (verified results).
 * This is simple math, not machine learning.
 */
export function updateWeights(
  currentWeights: Map<string, number>,
  signals: LearningSignal[],
): Map<string, number> {
  const updatedWeights = new Map(currentWeights);

  for (const signal of signals) {
    // We can only learn if a human has verified the result.
    if (signal.correct === null) continue;

    const adjustmentStep = signal.epsilon ?? 0.05;
    const multiplier = signal.strength ?? 2;

    // If correct, add to weight. If wrong, subtract.
    const difference = signal.correct
      ? adjustmentStep * multiplier
      : -(adjustmentStep * multiplier);

    for (const ruleId of signal.firedRuleIds) {
      const currentWeight = updatedWeights.get(ruleId) ?? 1.0;
      updatedWeights.set(ruleId, clampWeight(currentWeight + difference));
    }
  }

  return updatedWeights;
}

/**
 * Generates a summary of the system's accuracy over time.
 */
export function buildLearningSummary(
  totalDecisions: number,
  totalVerified: number,
  correctDecisions: number,
  accuracy30dAgo?: number,
): {
  totalDecisions: number;
  totalVerified: number;
  accuracy: number;
  headline: string;
} {
  const accuracy = totalVerified > 0 ? correctDecisions / totalVerified : 0;
  const accuracyPercentage = Math.round(accuracy * 100);

  // Get the descriptive text (Improving) based on the historical data.
  const trendText = getTrendText(accuracy, accuracy30dAgo);

  return {
    totalDecisions,
    totalVerified,
    accuracy,
    headline: `System learned from ${totalDecisions} decisions. Accuracy: ${accuracyPercentage}%${trendText}`,
  };
}
