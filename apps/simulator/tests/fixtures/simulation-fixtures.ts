import type { SimulationStartRequest } from "@pingpong/contracts";
import type { SimulatorConfig } from "../../src/config/env";

export const testSimulatorConfig = (overrides: Partial<SimulatorConfig> = {}): SimulatorConfig => ({
  appEnv: "test",
  port: 8090,
  enabled: true,
  adminToken: "test-admin-token",
  targetBaseUrl: "http://127.0.0.1:5173",
  targetApiUrl: "http://127.0.0.1:8080/api",
  targetRealtimeUrl: "ws://127.0.0.1:8080/ws",
  maxVirtualPlayers: 1000,
  maxDurationSeconds: 1800,
  maxUpdateFrequencyHz: 20,
  startupTimeoutMs: 5000,
  shutdownGraceMs: 5000,
  logLevel: "error",
  ...overrides
});

export const simulationRequest = (
  overrides: Partial<SimulationStartRequest> = {}
): SimulationStartRequest => ({
  virtualPlayers: 100,
  matches: 50,
  durationSeconds: 60,
  behaviorProfile: "balanced",
  updateFrequencyHz: 10,
  disconnectRatePerMinute: 0,
  reconnectRatePerMinute: 0,
  ...overrides
});
