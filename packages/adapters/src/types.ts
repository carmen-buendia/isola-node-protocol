// packages/adapters/src/types.ts.

// @isola-node/adapters - core types.
// Domain agnostic interfaces for ingesting data from heterogeneous sources.

/** Supported data sources in the Isola-Node ecosystem. */
export type SourceKind = "mock" | "sensor" | "satellite" | "manual";

/**
 * Standardised data reading, regardless of it's origin.
 * This is the unified schema stored in the local SQLite database.
 */
export interface StandardisedReading {
  /** ISO 8601 timestamp of when the reading was captured. */
  timestamp: string;
  /** Numerical value of reading. */
  value: number;
  /** Type of metric ("soil_moisture", "ndvi", "temperature", etc). */
  metric: string;
  /** ID of the device or API that generated the reading. */
  sourceId: string;
  /** Optional metadata for extra context (sensor battery level, etc). */
  metadata?: Record<string, unknown>;
}

/** Time range for querying historical data. */
export interface Query {
  from: string;
  to: string;
  limit?: number;
}
export interface AdapterMetadata {
  id: string;
  kind: SourceKind;
  name: string;
}

/** The main contract any data source must implement. */
export interface DataAdapter<T = StandardisedReading> {
  readonly metadata: AdapterMetadata;
  /** Checks if the source is currently reachable. */
  isAvailable(): Promise<boolean>;
  /** Fetches raw readings within a time range. */
  getReadings(query: Query): Promise<T[]>;
  /** Fetches readings sorted chronologically for charting. */
  getSeries(query: Query): Promise<T[]>;
}

/** Bounding box for satellite queries (Sentinel). */
export interface AreaOfInterest {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/**
 * Discriminated union for the Adapter factory.
 * Ensures compile time safety when creating new adapters.
 */
export type AdapterConfig<T = StandardisedReading> =
  | {
      kind: "mock";
      metadata: AdapterMetadata;
      data: T[];
      getTimestamp: (item: T) => string;
    }
  | {
      kind: "sensor";
      metadata: AdapterMetadata;
      endpoint: string;
      authToken: string;
    }
  | {
      kind: "satellite";
      metadata: AdapterMetadata;
      apiEndpoint: string;
      apiKey: string;
      areaOfInterest: AreaOfInterest;
      sentinel: "s1" | "s2" | "s3";
    };
