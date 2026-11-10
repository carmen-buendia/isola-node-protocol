// packages/adapters/src/sensor.adapter.ts

import type { AdapterMetadata, DataAdapter, Query } from "./types";

/**
 * Adapter for physical IoT hardware (Planned for v2: Arduino, ESP32, etc).
 *
 * NOT IMPLEMENTED YET.
 * This is a blueprint for the future integration.
 * When finished, it will:
 * - Fetch data from an MQTT broker or local HTTP gateway.
 * - Authenticate using the provided token.
 * - Cache the connection to avoid making a network request for every read.
 */
export class SensorDataAdapter<T> implements DataAdapter<T> {
  constructor(
    private readonly config: {
      metadata: AdapterMetadata;
      endpoint: string;
      authToken: string;
    },
  ) {}

  get metadata(): AdapterMetadata {
    return this.config.metadata;
  }

  async isAvailable(): Promise<boolean> {
    throw new Error("Sensor adapter is not implemented yet. Coming in v2.");
  }

  async getReadings(_query: Query): Promise<T[]> {
    throw new Error("Sensor adapter is not implemented yet. Coming in v2.");
  }

  async getSeries(_query: Query): Promise<T[]> {
    throw new Error("Sensor adapter is not implemented yet. Coming in v2.");
  }
}
