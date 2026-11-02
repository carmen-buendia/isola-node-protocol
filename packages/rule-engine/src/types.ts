// packages/rule-engine/src/types.ts

// @isola-node/rule-engine - Core types.
// Deterministic, explainable rule engine for local edge automation.

/** Output state based on rule evaluation. */
export type EngineState = "green" | "yellow" | "red" | "unknown";

/** Output state based on rule evaluation. */
export type RuleOperator =
  | "lessThan"
  | "lessThanOrEqual"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "equals"
  | "notEquals"
  | "isBetween"
  | "isOutside"
  | "increasedByMoreThan"
  | "decreasedByMoreThan"
  | "isTrendingUp"
  | "isTrendingDown";

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: number | [number, number];
}

/** Declarative rule evaluated by the engine. */
export interface EngineRule {
  id: string;
  label: string;
  conditions: RuleCondition[];
  votesFor: EngineState;
  baseConfidence: number;
  criteria: string[];
  version: number;
  active: boolean;
}

export interface FiredRule {
  ruleId: string;
  weight: number;
  vote: EngineState;
}

export interface InputConflict {
  sources: string[];
  description: string;
  resolution: "weighted" | "priority" | "ignored";
}

/** The payload passed into the engine for evaluation.
 * Contains the raw data and the optional context (time, location, etc).
 */
export interface EngineInput {
  data: Record<string, number | string | boolean | null>;
  context?: Record<string, unknown>;
}

/** The explained output of the engine.
 * Contains the final state, confidence level and reasoning.
 */
export interface EngineOutput {
  state: EngineState;
  confidence: number;
  headline: string;
  explanation: string;
  suggestedAction?: string;
  impact?: string;
  firedRules: FiredRule[];
  sourcesUsed: string[];
  conflicts: InputConflict[];
  ruleVersion: string;
}
