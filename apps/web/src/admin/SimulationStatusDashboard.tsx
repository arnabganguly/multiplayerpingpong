import type { SimulationRunSummary, SimulatorStatusResponse } from "@pingpong/contracts";

interface SimulationStatusDashboardProps {
  status?: SimulatorStatusResponse;
  loading: boolean;
  error?: string;
  onStop: () => Promise<void>;
  stopping: boolean;
}

const formatValue = (value: number) => new Intl.NumberFormat().format(value);

const runState = (run?: SimulationRunSummary | null) => run?.status ?? "idle";

export function SimulationStatusDashboard({
  status,
  loading,
  error,
  onStop,
  stopping
}: SimulationStatusDashboardProps) {
  const activeRun = status?.activeRun;
  const metrics = [
    ["Active virtual players", activeRun?.activeVirtualPlayers ?? 0],
    ["Active simulated matches", activeRun?.activeSimulatedMatches ?? 0],
    ["WebSocket connections", activeRun?.websocketConnections ?? 0],
    ["Messages per second", activeRun?.messagesPerSecond ?? 0],
    ["Failures", activeRun?.failures ?? 0],
    ["Remaining seconds", activeRun?.remainingSeconds ?? 0]
  ];

  return (
    <section className="simulation-dashboard" aria-label="Simulation status">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Simulation Status</p>
          <h2>{runState(activeRun)}</h2>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => void onStop()}
          disabled={!activeRun || stopping}
        >
          {stopping ? "Stopping..." : "Stop"}
        </button>
      </div>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="status-line">Refreshing</p>}

      <div className="metrics-grid">
        {metrics.map(([label, value]) => (
          <div className="metric-tile" key={label}>
            <span>{label}</span>
            <strong>{formatValue(Number(value))}</strong>
          </div>
        ))}
      </div>

      <div className="recent-runs">
        <h3>Recent Runs</h3>
        <div className="run-list">
          {(status?.recentRuns ?? []).slice(0, 5).map((run) => (
            <div className="run-row" key={run.runId}>
              <strong>{run.status}</strong>
              <span>{formatValue(run.configuration.virtualPlayers)} players</span>
              <span>{run.configuration.behaviorProfile}</span>
              <code>{run.runId}</code>
            </div>
          ))}
          {!status?.recentRuns.length && <p className="status-line">No runs yet</p>}
        </div>
      </div>
    </section>
  );
}
