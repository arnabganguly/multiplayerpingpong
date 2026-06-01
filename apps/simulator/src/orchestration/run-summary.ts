import { SimulationRunSummary } from "@pingpong/contracts";
import { SimulationMetrics } from "../metrics/simulation-metrics";
import { SimulationRunRecord } from "./simulation-repository";

export const toRunSummary = (
  record: SimulationRunRecord,
  metrics: SimulationMetrics
): SimulationRunSummary => {
  const now = Date.now();
  const createdAtMs = Date.parse(record.createdAt);
  const expiresAtMs = Date.parse(record.expiresAt);
  const snapshot = metrics.snapshot();
  const isActive = ["requested", "starting", "running", "stopping"].includes(record.status);

  return {
    runId: record.runId,
    status: record.status,
    configuration: record.configuration,
    activeVirtualPlayers: isActive
      ? (record.handle?.activeVirtualPlayers() ?? snapshot.active_virtual_players)
      : 0,
    activeSimulatedMatches: isActive
      ? (record.handle?.activeSimulatedMatches() ?? snapshot.active_simulated_matches)
      : 0,
    websocketConnections: snapshot.websocket_connections,
    messagesPerSecond: snapshot.messages_per_second,
    failures: snapshot.simulation_failures_total,
    elapsedSeconds: Math.max(0, Math.floor((now - createdAtMs) / 1000)),
    remainingSeconds: isActive ? Math.max(0, Math.ceil((expiresAtMs - now) / 1000)) : 0,
    createdAt: record.createdAt,
    startedAt: record.startedAt,
    stoppedAt: record.stoppedAt,
    lastError: record.lastError
  };
};
