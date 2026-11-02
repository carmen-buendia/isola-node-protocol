// packages/rule-engine/src/adapter.ts

import type { InputConflict } from "./types.js";

/**
 * The interface that allows the rule engine to read your specific data.
 * You implement this so the engine doesn't need to know your data structure.
 */
export interface EvidenceAdapter<TEvidence> {
  /**
   * Reads a specific field from the evidence.
   * Example: read(myData, "sensors.moisture")
   */
  read(evidence: TEvidence, path: string): number | undefined;

  /** Optional: Detects if two data sources disagree (e.g., sensor vs satellite). */
  detectConflicts?(evidence: TEvidence): InputConflict[];

  /** Optional: Lists which data sources were used to make the decision. */
  sourcesUsed?(evidence: TEvidence): string[];
}
