import { describe, expect, it } from "vitest";
import { DisconnectScheduler } from "../src/virtual-player/disconnect-scheduler";
import { SeededRandom } from "../src/virtual-player/seeded-random";

describe("DisconnectScheduler", () => {
  it("never disconnects when rates are zero", () => {
    const scheduler = new DisconnectScheduler(0, 0, new SeededRandom("zero"));
    expect(scheduler.shouldDisconnect(1000)).toBe(false);
    expect(scheduler.shouldReconnect(1000)).toBe(false);
  });

  it("caps high event rates at a guaranteed decision", () => {
    const scheduler = new DisconnectScheduler(60_000, 60_000, new SeededRandom("high"));
    expect(scheduler.shouldDisconnect(1000)).toBe(true);
    expect(scheduler.shouldReconnect(1000)).toBe(true);
  });
});
