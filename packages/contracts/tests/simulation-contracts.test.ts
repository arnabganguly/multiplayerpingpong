import { describe, expect, it } from "vitest";
import {
  assertSimulatorStatusResponse,
  validateSimulationStartRequest
} from "../src/simulation-http";

describe("simulation contracts", () => {
  it("accepts a valid simulation start request", () => {
    const result = validateSimulationStartRequest({
      virtualPlayers: 100,
      matches: 50,
      durationSeconds: 300,
      behaviorProfile: "balanced",
      updateFrequencyHz: 10,
      disconnectRatePerMinute: 0,
      reconnectRatePerMinute: 0
    });

    expect(result.ok).toBe(true);
    expect(result.value?.virtualPlayers).toBe(100);
  });

  it("rejects requests above the configured player limit", () => {
    const result = validateSimulationStartRequest({
      virtualPlayers: 1001,
      matches: 500,
      durationSeconds: 300,
      behaviorProfile: "balanced",
      updateFrequencyHz: 10,
      disconnectRatePerMinute: 0,
      reconnectRatePerMinute: 0
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_SIMULATION_REQUEST");
  });

  it("recognizes simulator status responses", () => {
    expect(
      assertSimulatorStatusResponse({
        enabled: true,
        environment: "local",
        activeRun: null,
        recentRuns: [],
        limits: {
          maxVirtualPlayers: 1000,
          maxDurationSeconds: 1800,
          maxUpdateFrequencyHz: 20
        }
      })
    ).toBe(true);
  });
});
