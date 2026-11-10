// demo.ts
import { createAdapter } from "./packages/adapters/src/registry";
import { decide } from "./packages/rule-engine/src/engine";
import type { EngineInput, EngineRule } from "./packages/rule-engine/src/types";
import type { EvidenceAdapter } from "./packages/rule-engine/src/adapter";

// 1. Define the rules of the engine (simulating those a farmer would have).
const farmRules: EngineRule[] = [
  {
    id: "soil_critical",
    label: "Soil in a critical condition (very low moisture content).",
    conditions: [{ field: "moisture", operator: "lessThan", value: 20 }],
    votesFor: "red",
    baseConfidence: 0.9,
    criteria: ["water"],
    version: 1,
    active: true,
  },
  {
    id: "soil_optimal",
    label: "Soil in optimal condition (adequate moisture).",
    conditions: [{ field: "moisture", operator: "isBetween", value: [30, 60] }],
    votesFor: "green",
    baseConfidence: 0.8,
    criteria: ["water"],
    version: 1,
    active: true,
  },
];

// 2. Create the adapter that reads the data from the sensor (simulating the hardware).
const sensorAdapter = createAdapter({
  kind: "mock",
  metadata: { id: "sensor-01", kind: "mock", name: "Weather station." },
  data: [
    {
      timestamp: "2026-11-02T10:00:00Z",
      value: 15,
      metric: "moisture",
      sourceId: "sensor-01",
    },
  ],
  getTimestamp: (reading: { timestamp: string }) => reading.timestamp,
});

// 3. Adapter for the Rule Engine (tells it how to read the data).
const evidenceAdapter: EvidenceAdapter<EngineInput> = {
  read: (input, path) => {
    // Search for the requested field within input.data.
    const value = input.data[path];
    return typeof value === "number" ? value : undefined;
  },
  detectConflicts: () => [],
  sourcesUsed: () => ["sensor-01"],
};

async function runDemo() {
  console.log("ISOLA-NODE INTEGRATION TEST.\n");

  // CASE 1: Low humidity (Alert).
  console.log("CASE 1: Sensor detects very low humidity (15 per cent).");
  const readings = await sensorAdapter.getReadings({
    from: "2026-11-01T00:00:00Z",
    to: "2026-11-03T00:00:00Z",
  });

  const inputCritical: EngineInput = {
    data: { moisture: readings[0].value },
    context: { timestamp: readings[0].timestamp, zone: "olivar-norte" },
  };

  const resultCritical = decide(inputCritical, farmRules, evidenceAdapter);
  console.log(`Estado: ${resultCritical.state.toUpperCase()}`);
  console.log(`Confianza: ${resultCritical.confidence}`);
  console.log(`Explicación: ${resultCritical.explanation}\n`);

  // CASE 2: Optimal humidity (Everything’s fine).
  console.log("CASE 2: Sensor detects optimum humidity (45 per cent).");
  const inputHealthy: EngineInput = {
    data: { moisture: 45 },
    context: { timestamp: new Date().toISOString(), zone: "olivar-norte" },
  };

  const resultHealthy = decide(inputHealthy, farmRules, evidenceAdapter);
  console.log(`Estado: ${resultHealthy.state.toUpperCase()}`);
  console.log(`Confianza: ${resultHealthy.confidence}`);
  console.log(`Explicación: ${resultHealthy.explanation}\n`);

  // CASE 3: No data (sensor failure).
  console.log("CASE 3: No data (sensor disconnected).");
  const inputEmpty: EngineInput = {
    data: {}, // No data available.
    context: { timestamp: new Date().toISOString(), zone: "olivar-norte" },
  };

  const resultEmpty = decide(inputEmpty, farmRules, evidenceAdapter);
  console.log(`Estado: ${resultEmpty.state.toUpperCase()}`);
  console.log(`Confianza: ${resultEmpty.confidence}`);
  console.log(`Explicación: ${resultEmpty.explanation}\n`);
}

runDemo().catch(console.error);
