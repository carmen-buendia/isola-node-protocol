// packages/adapters/src/satellite.adapter.ts

import type {
  AdapterMetadata,
  AreaOfInterest,
  DataAdapter,
  Query,
} from "./types";

/**
 * Adapter for satellite data (Planned for v2: Copernicus Sentinel).
 *
 * NOT IMPLEMENTED YET.
 * This is a blueprint for the future integration.
 * When finished, it will:
 * - Authenticate with the Copernicus Data Space API.
 * - Request satellite images for a specific area of interest.
 * - Extract vegetation indexes (like NDVI) for the requested dates.
 */
export class SatelliteDataAdapter<T> implements DataAdapter<T> {
  constructor(
    private readonly config: {
      metadata: AdapterMetadata;
      apiEndpoint: string;
      apiKey: string;
      areaOfInterest: AreaOfInterest;
      sentinel: "s1" | "s2" | "s3";
    },
  ) {}

  get metadata(): AdapterMetadata {
    return this.config.metadata;
  }

  async isAvailable(): Promise<boolean> {
    throw new Error("Satellite adapter is not implemented yet. Coming in v2.");
  }

  async getReadings(_query: Query): Promise<T[]> {
    throw new Error("Satellite adapter is not implemented yet. Coming in v2.");
  }

  async getSeries(_query: Query): Promise<T[]> {
    throw new Error("Satellite adapter is not implemented yet. Coming in v2.");
  }
}
