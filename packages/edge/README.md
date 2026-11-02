# @isola-node/edge.

The runtime that brings devices in the field to life.

## What exactly does it do?.

While `@isola-node/adapters` reads the data and `@isola-node/sync` sends it, `@isola-node/edge` is the brain that coordinates everything on the physical device (the Raspberry Pi or the ESP32). It is responsible for:

- **Reading the sensors**: It checks the hardware every X seconds.
- **Making local decisions**: It runs the rules engine instantly, without waiting for the cloud.
- **Storing everything safely**: If there is no internet connection, the data is securely stored in local memory (SQLite, SD card).
- **Synchronising when possible**: When the device regains connectivity (Wi-Fi or 4G), it passes the stored data to the `sync` package to send it to the cloud.

## What hardware is it designed for?.

The aim is for it to work even on the cheapest devices with the least battery life on the market:
| Device | Context | Typical use case |
| :--- | :--- | :--- |
| **Raspberry Pi** | Runs Linux and has more memory | Field gateways, multiple sensors simultaneously. |
| **ESP32** | Very little RAM, low power consumption | A single sensor (e.g. humidity), powered by a solar panel. |
| **ESP8266** | Very limited resources | Older devices or very simple projects. |
| **Generic** | Any hardware | So that other developers can adapt it to their inventions. |

## Why this is important.

In agriculture or environmental monitoring, there isn’t always good coverage. In fact, there almost never is.
Traditional architectures fail if the network goes down: the sensor stops working or data is lost. `@isola-node/edge` is designed to be **completely offline**. The device continues to take measurements, evaluate rules and store data even if it is cut off from the network for weeks.

## Current status (Under development).

At present, this package contains **only the architecture and interfaces (the contracts)**. I have defined how the device should behave and which methods it must have.
The internal logic (the engine that actually makes this work on a Raspberry Pi) is precisely one of the milestones to be developed with the funding from the grant.

## Licence.

Apache 2.0.
