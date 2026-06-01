import { describe, expect, it } from "vitest";
import { validateConfig } from "../src/orchestration/simulation-config";
import { simulationRequest, testSimulatorConfig } from "./fixtures/simulation-fixtures";

describe("simulation configuration validation", () => {
  it("accepts a valid 100 player request", () => {
    const result = validateConfig(simulationRequest(), testSimulatorConfig());
    expect(result.ok).toBe(true);
  });

  it("rejects requests over the configured player limit", () => {
    const result = validateConfig(
      simulationRequest({ virtualPlayers: 1001, matches: 1 }),
      testSimulatorConfig({ maxVirtualPlayers: 1000 })
    );
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_SIMULATION_REQUEST");
  });

  it("rejects requests when simulation is disabled", () => {
    const result = validateConfig(simulationRequest(), testSimulatorConfig({ enabled: false }));
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("SIMULATION_DISABLED");
  });
});
