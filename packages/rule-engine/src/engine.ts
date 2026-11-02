// packages/rule-engine/src/engine.ts

import type {
  EngineRule,
  EngineState,
  EngineOutput,
  RuleCondition,
  InputConflict,
} from "./types.js";
import type { EvidenceAdapter } from "./adapter.js";

export interface EngineOptions {
  /** Custom weights for specific rules (overrides the default weight of 1.0). */
  weights?: Map<string, number>;
  /** Custom function to generate the headline based on the state. */
  headlineBuilder?: (state: EngineState) => string;
  /** Custom function to generate the explanation based on the fired rules. */
  explanationBuilder?: (
    state: EngineState,
    firedRules: { rule: EngineRule; weight: number }[],
  ) => string;
  /** Custom function to calculate confidence (overrides the default math). */
  confidenceCalculator?: (
    firedRules: { rule: EngineRule; weight: number }[],
    state: EngineState,
    conflicts: InputConflict[],
  ) => number;
  /** Version label for the rule set. */
  ruleVersion?: string;
}

// Constants for the default confidence calculation.
const BASE_CONFIDENCE = 0.4;
const MAX_RATIO_BONUS = 0.55;
const CONFLICT_PENALTY = 0.15;
const MIN_CONFIDENCE = 0.3;
const MAX_CONFIDENCE = 0.95;

/**
 * Evaluates a single condition (e.g., "is moisture < 30?").
 */
function evaluateCondition(
  actualValue: number | undefined,
  operator: RuleCondition["operator"],
  targetValue: number | [number, number],
): boolean {
  if (actualValue === undefined) return false;

  switch (operator) {
    case "lessThan":
      return actualValue < (targetValue as number);
    case "lessThanOrEqual":
      return actualValue <= (targetValue as number);
    case "greaterThan":
      return actualValue > (targetValue as number);
    case "greaterThanOrEqual":
      return actualValue >= (targetValue as number);
    case "equals":
      return actualValue === (targetValue as number);
    case "notEquals":
      return actualValue !== (targetValue as number);
    case "isBetween": {
      const [min, max] = targetValue as [number, number];
      return actualValue >= min && actualValue <= max;
    }
    case "isOutside": {
      const [min, max] = targetValue as [number, number];
      return actualValue < min || actualValue > max;
    }
    default:
      return false;
  }
}

/**
 * Checks if all conditions of a rule are met. If so, it returns the rule and its weight.
 */
function evaluateRule<TEvidence>(
  rule: EngineRule,
  evidence: TEvidence,
  adapter: EvidenceAdapter<TEvidence>,
  weights: Map<string, number>,
): { rule: EngineRule; weight: number } | null {
  if (!rule.active) return null;

  for (const condition of rule.conditions) {
    const actualValue = adapter.read(evidence, condition.field);
    if (!evaluateCondition(actualValue, condition.operator, condition.value)) {
      return null; // Rule failed.
    }
  }

  // All conditions passed!
  const weight = weights.get(rule.id) ?? 1.0;
  return { rule, weight };
}

function defaultHeadline(state: EngineState): string {
  switch (state) {
    case "green":
      return "🟢 All good";
    case "yellow":
      return "🟡 Watch out";
    case "red":
      return "🔴 Act now";
    case "unknown":
      return "⚪ Not enough data";
  }
}

function defaultExplanation(
  state: EngineState,
  firedRules: { rule: EngineRule; weight: number }[],
): string {
  if (firedRules.length === 0) return "Not enough data to decide.";

  // Take the top 3 most important rules that were triggered.
  return firedRules
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((firedRule) => `• ${firedRule.rule.label}`)
    .join("\n");
}

/**
 * Default math to calculate confidence.
 * Starts at a base, adds a bonus based on how many rules agree, and subtracts penalties for conflicts.
 */
function defaultConfidence(
  firedRules: { rule: EngineRule; weight: number }[],
  state: EngineState,
  conflicts: InputConflict[],
): number {
  if (firedRules.length === 0) return 0;

  // Separate the rules that voted for the winning state.
  const winners = firedRules.filter(
    (firedRule) => firedRule.rule.votesFor === state,
  );

  const totalWeight = firedRules.reduce(
    (sum, firedRule) => sum + firedRule.weight,
    0,
  );
  const winnerWeight = winners.reduce((sum, winner) => sum + winner.weight, 0);

  if (totalWeight === 0) return 0;

  // How much of the total weight voted for the winning state? (0.0 to 1.0).
  const winningRatio = winnerWeight / totalWeight;

  // Calculate the score.
  let score = BASE_CONFIDENCE + winningRatio * MAX_RATIO_BONUS;
  score -= conflicts.length * CONFLICT_PENALTY;

  // Keep the score within safe boundaries.
  const finalScore = Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, score));
  return Number(finalScore.toFixed(2));
}

/**
 * The main function to evaluate rules against data.
 */
export function decide<TEvidence>(
  evidence: TEvidence,
  rules: EngineRule[],
  adapter: EvidenceAdapter<TEvidence>,
  options: EngineOptions = {},
): EngineOutput {
  const weights = options.weights ?? new Map<string, number>();
  const headlineBuilder = options.headlineBuilder ?? defaultHeadline;
  const explanationBuilder = options.explanationBuilder ?? defaultExplanation;
  const confidenceCalculator =
    options.confidenceCalculator ?? defaultConfidence;
  const ruleVersion = options.ruleVersion ?? "v1.0";

  // 1. Evaluate which rules fired.
  const firedRules: { rule: EngineRule; weight: number }[] = [];
  for (const rule of rules) {
    const result = evaluateRule(rule, evidence, adapter, weights);
    if (result) firedRules.push(result);
  }

  // 2. Count the votes for each state.
  const stateVotes: Record<EngineState, number> = {
    green: 0,
    yellow: 0,
    red: 0,
    unknown: 0,
  };
  for (const fired of firedRules) {
    stateVotes[fired.rule.votesFor] += fired.weight;
  }

  // 3. Find the winning state.
  let winningState: EngineState = "unknown";
  let maxVotes = 0;
  for (const [stateName, voteCount] of Object.entries(stateVotes)) {
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      winningState = stateName as EngineState;
    }
  }

  // 4. Generate the output with explanations.
  const conflicts = adapter.detectConflicts?.(evidence) ?? [];
  const confidence = confidenceCalculator(firedRules, winningState, conflicts);
  const sourcesUsed = adapter.sourcesUsed?.(evidence) ?? [];

  return {
    state: winningState,
    confidence,
    headline: headlineBuilder(winningState),
    explanation: explanationBuilder(winningState, firedRules),
    firedRules: firedRules.map((fired) => ({
      ruleId: fired.rule.id,
      weight: fired.weight,
      vote: fired.rule.votesFor,
    })),
    sourcesUsed,
    conflicts,
    ruleVersion,
  };
}
