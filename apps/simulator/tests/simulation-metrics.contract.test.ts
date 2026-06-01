import { describe, expect, it } from "vitest";
import { SimulationMetrics } from "../src/metrics/simulation-metrics";

describe("simulation metrics contract", () => {
  it("renders required Prometheus metrics", () => {
    const metrics = new SimulationMetrics();
    metrics.runStarted();
    metrics.setActiveVirtualPlayers(100);
    metrics.setActiveSimulatedMatches(50);
    metrics.connectionOpened();
    metrics.messageSent();

    const rendered = metrics.render();
    expect(rendered).toContain("active_virtual_players 100");
    expect(rendered).toContain("active_simulated_matches 50");
    expect(rendered).toContain("websocket_connections 1");
    expect(rendered).toContain("messages_per_second");
    expect(rendered).toContain("simulation_runs_total 1");
    expect(rendered).toContain("simulation_failures_total 0");
  });
});
