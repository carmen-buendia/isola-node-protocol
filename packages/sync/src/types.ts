// packages/sync/src/types.ts

// @isola-node/sync - Core types.
// CRDT-based synchronization engine for local-first edge devices.
// Standards: MQTT 3.1.1/5.0, CoAP (RFC 7252), HTTP.
// Zero runtime dependencies. Pure Typescript.

/** Supported network transports for synchronization. */
export type SyncTransport = "mqtt" | "coap" | "http";

/**
 * An event buffered locally awaiting sync to cloud.
 * Uses monotonic sequence numbers for conflict-free ordering.
 */
export interface BufferedEvent<TPayload = unknown> {
  /** Unique event ID (UUID v7 recommended). */
  id: string;
  /** Device that generated the event. */
  deviceId: string;
  /** Monotonic sequence number per device. */
  sequence: number;
  /** ISO 8601 timestamp of when the event was captured. */
  capturedAt: string;
  /** Serializable payload. */
  payload: TPayload;
  /** Number of sync attempts so far. */
  retries: number;
  /** Last attempt timestamp (ISO 8601). */
  lastAttemptAt?: string;
}

export interface SyncCredentials {
  username?: string;
  password?: string;
  clientCert?: string;
  bearerToken?: string;
}

export interface SyncConfig {
  deviceId: string;
  transport: SyncTransport;
  endpoint: string;
  bufferCapacity: number;
  flushIntervalMs: number;
  maxRetries: number;
  credentials?: SyncCredentials;
}

export type SyncStatus = "idle" | "syncing" | "offline" | "error";

export interface SyncState {
  status: SyncStatus;
  bufferedCount: number;
  lastSyncedAt?: string;
  lastError?: string;
}

export interface SyncResult {
  sent: number;
  failed: number;
  remaining: number;
  attemptedAt: string;
}

/**
 * Abstract storage for the event buffer.
 * Implementation can be SQLite, a JSON file, or an in-memory ring buffer.
 */
export interface BufferStore<TPayload = unknown> {
  push(event: BufferedEvent<TPayload>): Promise<void>;
  peek(limit: number): Promise<BufferedEvent<TPayload>[]>;
  ack(eventId: string): Promise<void>;
  nack(eventId: string): Promise<void>;
  size(): Promise<number>;
  clear(): Promise<void>;
}

/**
 * A transport implementation. Any implementation that satisfies this.
 * Interface works (MQTT, CoAP, HTTP, custom).
 */
export interface Transport {
  connect(config: SyncConfig): Promise<void>;
  disconnect(): Promise<void>;
  send(events: BufferedEvent[]): Promise<SyncResult>;
  isConnected(): boolean;
}

/**
 * A local persistence layer for the last-synced sequence.
 */
export interface SequenceTracker {
  getLastAcked(deviceId: string): Promise<number>;
  setLastAcked(deviceId: string, sequence: number): Promise<void>;
}
