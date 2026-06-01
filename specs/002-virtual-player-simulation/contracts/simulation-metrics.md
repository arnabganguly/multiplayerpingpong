# Simulation Metrics Contract

The simulator service exposes Prometheus-compatible metrics. Metric names below are part of the feature contract and must remain stable unless a future migration plan is published.

## Required Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `active_virtual_players` | Gauge | Number of virtual players currently allocated to active simulation runs. |
| `active_simulated_matches` | Gauge | Number of simulated matches currently active. |
| `websocket_connections` | Gauge | Number of simulator-owned WebSocket connections currently open. |
| `messages_per_second` | Gauge | Rolling rate of simulator-sent and simulator-received realtime messages per second. |
| `simulation_runs_total` | Counter | Total number of simulation runs requested since simulator process start. |
| `simulation_failures_total` | Counter | Total number of simulation failures since simulator process start. |

## Label Rules

- Labels must be low cardinality.
- Allowed default labels: `environment`, `status`, and `behavior_profile`.
- Disallowed default labels: run id, player id, session id, join code, token, or WebSocket URL.

## Accuracy Rules

- During steady-state load, `active_virtual_players` and `active_simulated_matches` must stay within 10% of the simulator run summary.
- Connection gauges must decrement when virtual players stop, disconnect, or fail connection setup.
- Failure counters must increment for run-level failures and unrecoverable orchestration failures.

## Example Exposition

```text
# HELP active_virtual_players Number of virtual players currently allocated to active simulation runs.
# TYPE active_virtual_players gauge
active_virtual_players{environment="dev",behavior_profile="balanced"} 100
# HELP active_simulated_matches Number of simulated matches currently active.
# TYPE active_simulated_matches gauge
active_simulated_matches{environment="dev"} 50
# HELP websocket_connections Number of simulator-owned WebSocket connections currently open.
# TYPE websocket_connections gauge
websocket_connections{environment="dev"} 100
# HELP messages_per_second Rolling rate of simulator realtime messages per second.
# TYPE messages_per_second gauge
messages_per_second{environment="dev"} 1200
# HELP simulation_runs_total Total number of simulation runs requested.
# TYPE simulation_runs_total counter
simulation_runs_total{environment="dev",status="completed"} 7
# HELP simulation_failures_total Total number of simulation failures.
# TYPE simulation_failures_total counter
simulation_failures_total{environment="dev"} 1
```
