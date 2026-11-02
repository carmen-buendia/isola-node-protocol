# @isola-node/rule-engine.

The decision-making brain in the field, even when there’s no internet.

## Why this exists.

When you’re working in the countryside (monitoring the soil, managing irrigation water, etc.), you often don’t have internet access. And more importantly, you can’t afford a "black box" that tells you to do something without explaining why.

I built this engine because I needed something I could rely on: given the same sensor data, it must always produce exactly the same result. No hidden neural networks, no machine learning and no reliance on the cloud. Just simple, human-readable rules that you can audit and modify yourself.

## How it works.

The engine is completely agnostic. It doesn’t know whether it’s evaluating soil moisture or wind speed. You provide the data and the rules, and it calculates the output.

EvidenceAdapter: A simple interface that you implement to tell the engine how to read your specific data.

Rules: Simple JSON objects (e.g. “If moisture < 30%, vote for RED”).

Output: The engine returns a status (green, yellow, red), a confidence score and a clear explanation of which rules were triggered.

## Installation

```bash
pnpm add @isola-node/rule-engine
```

### Usage example

```ts
import {
decide,
type EvidenceAdapter,
type EngineRule,
type EngineInput
} from "@isola-node/rule-engine’;

// 1. Define how the engine should read your data.
const adapter: EvidenceAdapter<MyData> = {
read: (data, path) => resolvePath(data, path),
detectConflicts: (data) => [],
sourcesUsed: (data) => ["sensor-01"],
};

// 2. Prepare the input (data + context).
const input: EngineInput = {
data: { moisture: 25, temperature: 18 },
context: {
timestamp: new Date().toISOString(),
zone: "north-zone"
}
};

// 3. Declare your rules (these can be saved in a local JSON file).
const rules: EngineRule[] = [
{
id: "soil_dry",
label: "The soil is dry",
conditions: [{ field: "moisture", operator: "lessThan", value: 30 }],
votesFor: "red",
baseConfidence: 0.9,
criteria: ["water"],
version: 1,
active: true,
},
];

// 4. Evaluate.
const result = decide(input, rules, adapter);

console.log(result.state);       // "red"
console.log(result.explanation); // "The "soil_dry" rule was triggered because the moisture level was 25."
```

## API Overview.

- **decide(input, rules, adapter, options):** The main function. It takes an EngineInput (data and context), evaluates the rules and returns an EngineOutput containing the state, the confidence level and the list of rules that were triggered.

- **updateWeights(...):** A simple arithmetic function if you wish to adjust the weighting of the rules based on past feedback. (No machine learning involved, just maths).

- **buildLearningSummary(...):** A helper function for calculating basic statistics for your user interface.

## States and Rules.

The engine evaluates rules using standard logic (AND). If all the conditions of a rule are met, it ‘votes’ for a specific state.

- **States:** green (healthy), yellow (warning), red (critical), or unknown (missing data).

- **Confidence:** A score from 0 to 1, which decreases if there are conflicting data sources (for example, if the sensor says one thing and the satellite says another).

The package has no runtime dependencies. It is written in pure TypeScript and can run on Node.js, Deno, Bun or edge environments such as Cloudflare Workers.

## Licence.

Apache 2.0.
