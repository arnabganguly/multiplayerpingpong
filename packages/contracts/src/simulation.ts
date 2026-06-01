export type SimulationStatus =
  | "requested"
  | "starting"
  | "running"
  | "stopping"
  | "completed"
  | "failed";

export type SimulationBehaviorProfile = "balanced" | "aggressive" | "defensive" | "erratic";

export interface SimulationStartRequest {
  virtualPlayers: number;
  matches: number;
  durationSeconds: number;
  behaviorProfile: SimulationBehaviorProfile;
  updateFrequencyHz: number;
  disconnectRatePerMinute: number;
  reconnectRatePerMinute: number;
  seed?: string;
}

export type SimulationConfiguration = SimulationStartRequest;

export interface SimulationRunSummary {
  runId: string;
  status: SimulationStatus;
  configuration: SimulationConfiguration;
  activeVirtualPlayers: number;
  activeSimulatedMatches: number;
  websocketConnections: number;
  messagesPerSecond: number;
  failures: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  createdAt: string;
  startedAt?: string;
  stoppedAt?: string;
  lastError?: string;
}

export interface SimulatorStatusResponse {
  enabled: boolean;
  environment: string;
  activeRun: SimulationRunSummary | null;
  recentRuns: SimulationRunSummary[];
  limits: {
    maxVirtualPlayers: number;
    maxDurationSeconds: number;
    maxUpdateFrequencyHz: number;
  };
}

export interface SimulationMetricSnapshot {
  active_virtual_players: number;
  active_simulated_matches: number;
  websocket_connections: number;
  messages_per_second: number;
  simulation_runs_total: number;
  simulation_failures_total: number;
}

export const SIMULATION_BEHAVIOR_PROFILES: SimulationBehaviorProfile[] = [
  "balanced",
  "aggressive",
  "defensive",
  "erratic"
];

export const isSimulationBehaviorProfile = (value: unknown): value is SimulationBehaviorProfile =>
  value === "balanced" || value === "aggressive" || value === "defensive" || value === "erratic";

export const isSimulationStatus = (value: unknown): value is SimulationStatus =>
  value === "requested" ||
  value === "starting" ||
  value === "running" ||
  value === "stopping" ||
  value === "completed" ||
  value === "failed";
