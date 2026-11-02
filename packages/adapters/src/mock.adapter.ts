// packages/adapters/src/mock.adapter.ts

import type { AdapterMetadata, DataAdapter, Query } from "./types.js";

/**
 * A simple, in-memory adapter used for testing.
 * It holds an array of data and filters it by date, without needing internet.
 */
export class MockDataAdapter<T> implements DataAdapter<T> {
  constructor(
    private readonly config: {
      metadata: AdapterMetadata;
      data: T[];
      getTimestamp: (item: T) => string;
    },
  ) {}

  get metadata(): AdapterMetadata {
    return this.config.metadata;
  }

  async isAvailable(): Promise<boolean> {
    // Mock data is always available locally.
    return true;
  }

  async getReadings(query: Query): Promise<T[]> {
    const startTime = new Date(query.from).getTime();
    const endTime = new Date(query.to).getTime();

    // Filter the data to find items within the requested time range.
    const itemsInRange = this.config.data.filter((item) => {
      const itemTime = new Date(this.config.getTimestamp(item)).getTime();
      return itemTime >= startTime && itemTime <= endTime;
    });

    // If the user asked for a limit, return only the first X items.
    if (query.limit !== undefined) {
      return itemsInRange.slice(0, query.limit);
    }

    return itemsInRange;
  }

  async getSeries(query: Query): Promise<T[]> {
    const readings = await this.getReadings(query);

    // Sort chronologically (oldest first) so charts render correctly.
    return readings.sort((itemA, itemB) => {
      const timeA = new Date(this.config.getTimestamp(itemA)).getTime();
      const timeB = new Date(this.config.getTimestamp(itemB)).getTime();
      return timeA - timeB;
    });
  }
}
