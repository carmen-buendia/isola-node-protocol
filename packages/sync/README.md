# @isola-node/sync.

The communication bridge between the field and the cloud (when there’s coverage).

## Why this exists.

Out in the field, internet connectivity comes and goes. One day you’ve got 4G on the farm, and the next there’s nothing. Commercial IoT solutions either assume you’re always connected or force you to use their own cloud.

I built this package to solve that problem. It’s a synchronisation layer that ensures your sensor data reaches the cloud without getting lost along the way, but without locking up the device if there’s no network. If there’s no internet, the data is stored and held in reserve. When coverage returns, it’s sent.

## What exactly does it do?.

It stores data locally: It maintains a queue of events waiting to be sent.

It sends data whenever possible: It makes the most of any connectivity window (Wi-Fi or 4G) to clear the queue.

It maintains the correct order: It uses sequence numbers to ensure that data arrives in the correct order, even if sent in batches.

It is fail-safe: If the device switches off mid-transmission, nothing is lost.

## The protocols it supports.

I haven’t invented a new protocol. I’ve designed this to use IoT industry standards:

- **MQTT 3.1.1 / 5.0:** The go-to choice for devices with low battery life and poor signal.

- **CoAP (RFC 7252):** An ultra-lightweight protocol for very resource-constrained devices (such as the ESP32).

- **HTTP:** The classic choice, ideal for gateways with more resources or for testing.

## Why this is important.

Most trading platforms force you to use their servers. @isola-node/sync is provider-agnostic and self-hostable. You decide which server the data is sent to (it could be a European VPS or a Raspberry Pi in your own home).

By not relying on anyone else, we ensure that the data remains yours.

## Design Principles.

- **Zero dependencies:** It is pure TypeScript. It does not bring any third-party code onto the device.

- **Pluggable transport:** You provide your own MQTT, CoAP or HTTP client. The engine only handles the logic.

- **Pluggable storage:** You can store data in SQLite, on an SD card or in RAM, depending on your hardware’s requirements.

## The flow (How data travels).

The process is very simple and is designed to ensure that not a single piece of data is lost:

1. **The application reads the sensor:** A new data point is generated.

2. **An event is created (BufferedEvent):** The data is packaged with a unique sequence number (to know exactly in what order it arrived).

3. **It is safely stored (BufferStore):** The event is physically stored on the local drive (SD card, flash memory or RAM).

4. **The transport retrieves it (Transport):** When the device detects a connection, the transport (MQTT, CoAP or HTTP) retrieves the events from storage.

5. **It is sent to the server:** The data reaches the cloud (or your own local server), and is deleted from the device to free up space.

## Current status (In development).

To be transparent: this package contains the architecture, the types and the interface definitions.

I have a clear understanding of how the workflow operates and which methods need to be in place, but the logic of the synchronisation engine itself (the actual implementation of the CRDT and conflict resolution) is one of the key milestones for which I am seeking funding.

## LICENSE.

Apache 2.0.
