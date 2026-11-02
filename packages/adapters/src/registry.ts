// packages/adapters/src/registry.ts

import type { AdapterConfig, DataAdapter } from "./types.js";
import { MockDataAdapter } from "./mock.adapter.js";
import { SensorDataAdapter } from "./sensor.adapter.js";
import { SatelliteDataAdapter } from "./satellite.adapter.js";

/**
 * The Adapter Factory.
 * It reads the configuration object and builds the correct adapter automatically.
 * This way, the rest of the app doesn't need to know which class to instantiate.
 */
export function createAdapter<T>(config: AdapterConfig<T>): DataAdapter<T> {
  switch (config.kind) {
    case "mock":
      return new MockDataAdapter<T>({
        metadata: config.metadata,
        data: config.data,
        getTimestamp: config.getTimestamp,
      });

    case "sensor":
      return new SensorDataAdapter<T>({
        metadata: config.metadata,
        endpoint: config.endpoint,
        authToken: config.authToken,
      });

    case "satellite":
      return new SatelliteDataAdapter<T>({
        metadata: config.metadata,
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey,
        areaOfInterest: config.areaOfInterest,
        sentinel: config.sentinel,
      });
  }
}
