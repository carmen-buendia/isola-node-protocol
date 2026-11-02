// packages/adapters/src/mock.adapter.test.ts

import { describe, it, expect } from "vitest";
import { MockDataAdapter } from "./mock.adapter.js";

// A simple type to simulate a sensor reading.
type TemperatureReading = {
  recordedAt: string;
  temperature: number;
};

describe("MockDataAdapter", () => {
  // We set up some test data with clear, readable dates.
  const testData: TemperatureReading[] = [
    { recordedAt: "2026-10-01T12:00:00Z", temperature: 10 }, // Oct 1st.
    { recordedAt: "2026-10-05T12:00:00Z", temperature: 50 }, // Oct 5th.
    { recordedAt: "2026-10-03T12:00:00Z", temperature: 30 }, // Oct 3rd.
  ];

  const adapter = new MockDataAdapter<TemperatureReading>({
    metadata: {
      id: "test-station",
      kind: "mock",
      name: "Test Weather Station",
    },
    data: testData,
    getTimestamp: (reading) => reading.recordedAt,
  });

  it("returns the metadata correctly", () => {
    expect(adapter.metadata.name).toBe("Test Weather Station");
  });

  it("is always available because it runs locally", async () => {
    expect(await adapter.isAvailable()).toBe(true);
  });

  it("filters readings by the requested date range", async () => {
    const result = await adapter.getReadings({
      from: "2026-10-01T00:00:00Z",
      to: "2026-10-03T23:59:59Z",
    });
    // Should find Oct 1st and Oct 3rd.
    expect(result).toHaveLength(2);
  });

  it("sorts readings chronologically for charts", async () => {
    const result = await adapter.getSeries({
      from: "2026-10-01T00:00:00Z",
      to: "2026-10-05T23:59:59Z",
    });
    // Even though the data was out of order, the series should be sorted: 10, 30, 50.
    expect(result[0].temperature).toBe(10);
    expect(result[1].temperature).toBe(30);
    expect(result[2].temperature).toBe(50);
  });

  it("respects the maximum limit of results", async () => {
    const result = await adapter.getReadings({
      from: "2026-10-01T00:00:00Z",
      to: "2026-10-05T23:59:59Z",
      limit: 2,
    });
    expect(result).toHaveLength(2);
  });

  it("returns an empty array when there is no data in that range", async () => {
    const result = await adapter.getReadings({
      from: "2025-01-01T00:00:00Z",
      to: "2025-01-02T00:00:00Z",
    });
    expect(result).toHaveLength(0);
  });

  it("includes readings that happen exactly at the start/end boundaries", async () => {
    const result = await adapter.getReadings({
      from: "2026-10-01T12:00:00Z",
      to: "2026-10-01T12:00:00Z",
    });
    expect(result).toHaveLength(1);
  });
});
