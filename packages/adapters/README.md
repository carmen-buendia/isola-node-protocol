# @isola-node/adapters.

The universal translator for your field data.

## Why I built this.

In the real world, data comes in a thousand different formats. An Arduino humidity sensor sends one type of data, Copernicus satellites send a completely different one, and a weather API sends yet another.
If the rule engine (`rule-engine`) had to understand all those formats, it would be chaos. So I built this package: **an adaptation layer that standardises everything**. It doesn’t matter where the data comes from; the adapters transform it into a standard, uniform format (`StandardisedReading`) before passing it on to the rest of the system.

## What it does exactly.

- **It abstracts away the complexity**: The rest of the infrastructure doesn’t need to know whether the data comes from a satellite or a sensor. It simply receives clean, standardised data.
- **Avoids vendor lock-in**: You can switch APIs or sensors without having to rewrite the rest of your application.
- **It is strongly typed**: If you try to create an adapter for satellites, the system forces you (at TypeScript level) to pass it the coordinates of the area of interest (`areaOfInterest`). There is no room for error.

## Current status: The most mature package.

I want to be transparent about where we stand. Of all the Isola-Node packages, **`adapters` is currently the most mature**.

- **The `MockDataAdapter` is 100% complete**: Not only does it work, but it also has a comprehensive test suite using **Vitest**. This ensures that the logic for date filtering, chronological sorting and data limits works perfectly.
- **The other adapters are designed**: The `SensorDataAdapter` (for IoT) and `SatelliteDataAdapter` (for Copernicus) files are documented stubs. They have defined interfaces and structure, but the actual connection logic will be implemented during the funding period.

## What this package includes.

- **The `DataAdapter` interface**: The generic contract that any data source must fulfil.
- **The `createAdapter` factory**: A safe function (discriminated union) that creates the correct adapter based on the configuration you pass to it.
- **Zero dependencies in production**: It is pure TypeScript. The code sent to the device does not carry any heavy libraries.

## Licence.

Apache 2.0.
