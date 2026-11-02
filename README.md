# Isola-Node Protocol.

I designed Isola-Node as an open-source infrastructure and a local-first synchronization protocol for sovereign data in edge devices.

It is a standalone, domain-agnostic layer. This protocol resolves the challenge of the sovereing data and the syncronisation in enviroments where internet access is intermittent or has a weak signal (like rural zones or remote monitoring stations).

While dominant IoT platforms remain cloud-centric (extracting data from communities to third-party servers), a vibrant "local-first" ecosystem is emerging. However, these tools are often fragmented. I built Isola-Node to provide a cohesive, open-source infrastructure with P2P capabilities to fill that gap. SikeliaSoil is its first reference implementation.

## The Problem: Cloud Dependencies and Digital Extraction.

I built this because in rural zones, the conectivity is not garanted. Current IoT solutions (like Google Cloud IoT or AWS IoT) requires a constant conexion to a central server. If the conexion goes down, we lost the data or the device stops working.

The worst thing is that data collected by the devices is often extracted and monetised by cloud providers. The communities that generated data lost control about this. There is no open-source infrastructure that would enable them to take control of their own data ecosystem.

## My Solution: The Isola-Node Protocol.

I designed Isola-Node as a middleware and protocol suite built around four fundamentals principles, with open-source data sovereignty at its core:

1. **Data sovereignty (open-source):** The infrastructure is open-source and the user is the sole owner of the database. By design, data is stored locally and never leaves the device unless the user explicity chooses to syncronise it. There is no mandatory central server, no vendor lock-in, and no corporate data extraction.
2. **Local-first architecture:** All data are generated, saved and procesed in the local device using libSQL/SQLite. The application remains 100 per cent functional without internet connection.
3. **Eventual Consistency (CRDTs):** When the device reconnects, Isola-Node synchronises the local SQLite replicas with a remote server using conflict-free replicated data types (CRDTs).
4. **Lightweight Transport:** It uses MQTT and CoAP over constrained networks to minimise bandwidth usage, ensuring it works on 2G networks or LoRaWAN gateways.

## Architecture: The Four Packages.

I designed Isola-Node as an open-source modular infrastructure compose by four independents packages. This desacoplated architecture assures that developers can use only the component that their needs, making it highly reusable for any edge computing project.

1. **adapters (Data Ingestion & Standardisation):**
   This layer acts as a bridge between the physical world and the Isola-Node ecosystem. It contains standardized interfaces for connecting external data sources (IoT hardware, Earth observation APIs like Copernicus). The raw data is ingested, standardised, and mapped to a standard schema before being passed to the edge execution environment.

2. **edge (Local-first Runtime):**
   This is the heart of the sovereignty model of data. It runs directly in the hardware of the user (Raspberry Pi, local server or smartphone). It features an embebed database (libSQL/SQLite) for 100% offline storage and a local API for the user interface to consume data without internet.

3. **sync (CRDT Synchronization Engine):**
   The central protocol. When the devices recovers connectivity (local WIFI, 4g, etc.), this engine runs the synchronization P2P or server-client. It resolves conflicts using CRDTs to merge offline changes without loss of data, and it uses Delta sync (only transmits the differences) to minimise bandwidth, making it suitable for 2G or LoRaWAN networks.

4. **rule-engine (Domain-agnostic logic):**
   To make data actionable offline, I included a deterministic and explainable rules-engine. It evaluates incoming sensors data against user-defined rules and generates JSON-based explanations of why a rule was triggered, which is crucial for scientific transparency.

## Current Status: Foundational Prototypes.

Although the protocol is currently being specified, I have already developed the initial version of all four packages in this repository:

- **@isola-node/adapters**: Is a typed neutral data ingestion layer; it includes a standardised schema ("StandardisedReading") to unify data from IoT sensors and Copernicus satellite in a single SQLite database. It already features tests in Vitest and documented stubs.
- **@isola-node/rule-engine**: Is a local deterministic and explainable rule engine. It enables the evaluation of sensor data offline and the generation of explanations in JSON format.
- **@isola-node/sync** & **@isola-node/edge**: The architecture, types, and interfaces are fully defined. The core implementation (CRDT logic and edge orchestration) is planned for the funded period.

These baseline prototypes demostrate my ability to build modular and local-first infrastructure. The grant will be used to strengthen this work, expand the tests to production level, and ensure compatibility with the edge.

## Proof of cConcept demo.

To verify the integration between the "adapters" and the "rule-engine", we hace included a demo script in the root of the repository.

You can run it directly to see how the system ingest data, applies deterministic rules, and generates an explainable output.

```
bash
# Root of the repository.
npx tsx demo.ts
```

## License.

Apache 2.0.
