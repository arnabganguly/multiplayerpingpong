import { describe, expect, it, vi } from "vitest";
import type { MatchOrchestrator } from "../src/orchestration/match-orchestrator";
import { SimulationMetrics } from "../src/metrics/simulation-metrics";
import { SimulationRepository } from "../src/orchestration/simulation-repository";
import { SimulationService } from "../src/orchestration/simulation-service";
import { simulationRequest, testSimulatorConfig } from "./fixtures/simulation-fixtures";
import { waitForExpectation } from "./setup";

describe("SimulationService", () => {
  it("starts and stops a simulation run", async () => {
    const stop = vi.fn(async () => undefined);
    const orchestrator = {
      start: vi.fn(async () => ({
        stop,
        activeVirtualPlayers: () => 100,
        activeSimulatedMatches: () => 50
      }))
    } as unknown as MatchOrchestrator;
    const metrics = new SimulationMetrics();
    const service = new SimulationService(
      testSimulatorConfig(),
      new SimulationRepository(),
      orchestrator,
      metrics
    );

    const started = service.start(simulationRequest());
    expect(started?.status).toBe("starting");
    await waitForExpectation(() => expect(service.status().activeRun?.status).toBe("running"));

    const stopped = await service.stop();
    expect(stopped?.status).toBe("completed");
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("rejects a second active simulation run", async () => {
    const orchestrator = {
      start: vi.fn(
        async () =>
          new Promise(() => ({
            stop: async () => undefined,
            activeVirtualPlayers: () => 100,
            activeSimulatedMatches: () => 50
          }))
      )
    } as unknown as MatchOrchestrator;
    const service = new SimulationService(
      testSimulatorConfig(),
      new SimulationRepository(),
      orchestrator,
      new SimulationMetrics()
    );

    expect(service.start(simulationRequest())).toBeTruthy();
    expect(service.start(simulationRequest())).toBeUndefined();
  });
});
