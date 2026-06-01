# Simulation Dashboard

Create a Grafana or Azure Managed Grafana dashboard for the `load-generator`
workload with these panels:

- Active virtual players: `active_virtual_players`
- Simulated matches: `active_simulated_matches`
- WebSocket connections: `websocket_connections`
- Message rate: `messages_per_second`
- Run count: `simulation_runs_total`
- Failure count: `simulation_failures_total`
- Kubernetes CPU, memory, restarts, readiness, and HPA replica count for
  `deployment/load-generator`

Place simulator panels next to realtime gameplay panels so operators can compare
generated load with gameplay health during validation.
