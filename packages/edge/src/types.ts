// packages/edge/src/types.ts

// @isola-node/edge - Cory types.
// Lightweight runtime environment for constrined edge devices (Raspberry Pi, ESP32, etc).
// Orchestrates sensors, local rules and the sync engine.

import { EngineRule, EngineOutput } from "@isola-node/rule-engine";
import type { BufferedEvent, SyncConfig } from "@isola-node/sync";

/** Supported hardware classes for the edge runtime. */
export type DeviceClass = "rpi" | "esp32" | "esp8266" | "generic";

/** Global configuration for the edge device. */
export interface EdgeDeviceConfig {
  deviceId: string;
  deviceClass: DeviceClass;
  /** Configuration for the network synchronization engine. */
  sync: SyncConfig;
  /** How often to poll hardware sensors (in millisecons). */
  sensorPollingIntervalMs: number;
  /** Max events to hold in local memory before writing to disk. */
  bufferCapacity: number;
  /** If true, the device evaluates rules locally even without internet. */
  runLocalRules: boolean;
  metadata?: Record<string, unknown>;
}

/** Contract for physical sensor drivers.
 * Implementations should handle hardware-specific protocols.
 */
export interface SensorDriver<TPayload = number> {
  readonly sensorId: string;
  /** The unit of measure ("%", "°C", etc). */
  readonly unit: string;
  /** The expected time between reads (in milliseconds). */
  readonly intervalMs: number;
  /** Triggers a physical read and returns a standardised buffered event. */
  read(): Promise<BufferedEvent<TPayload>>;
}

/** Contract for GPS/GNSS modules to geotag readings. */
export interface GnssProvider {
  readonly available: boolean;
  getCurrentPosition(): Promise<{
    latitude: number;
    longitude: number;
    /** Accuracy in meters. */
    accuracyM: number;
    capturedAt: string;
  } | null>;
}

/**
 * Rule engine rule wrapped with an optional local callback.
 * Useful for triggering physical actions (opening a valve, etc).
 */
export interface EdgeRule {
  id: string;
  label: string;
  rule: EngineRule;
  /** Optional action to take when the rule fires. */
  onFire?: (output: EngineOutput) => Promise<void>;
}

export type EdgeRuntimeStatus =
  | "starting"
  | "running"
  | "degraded"
  | "offline"
  | "stopped"
  | "error";

/** Diagnostic state of the edge runtime. */
export interface EdgeRuntimeState {
  status: EdgeRuntimeStatus;
  startedAt?: string;
  lastSensorReadAt?: string;
  lastSyncAt?: string;
  bufferedEventCount: number;
  uptimeSeconds: number;
  lastError?: string;
}

/** Abstract local persistence layer (SQLite on the SD card, etc).
 * Distinct from the sync BufferStore: this handles the actual physical storage of the device, not just the network queue.
 */
export interface EdgeStorage {
  init(): Promise<void>;
  saveEvent(event: BufferedEvent): Promise<void>;
  getPendingEvents(limit: number): Promise<BufferedEvent[]>;
  markSynced(eventIds: string[]): Promise<void>;
  close(): Promise<void>;
}

/** The main lifecycle interface for the edge gateway. */
export interface EdgeRuntime {
  /** Boots up the device, initializes storage, and starts polling sensors. */
  start(config: EdgeDeviceConfig): Promise<void>;
  /** Gracefully shuts down sensors and flushes pending data. */
  stop(): Promise<void>;
  /** Returns the current diagnostic state (uptime, battery, last sync, etc). */
  getState(): EdgeRuntimeState;
  /** Registers a new hardware sensor at runtime (a new soil probe). */
  registerSensor(sensor: SensorDriver): Promise<void>;
  /** Registers a new local rule at runtime. */
  registerRule(rule: EdgeRule): Promise<void>;
}
