# Simulation Alerts

Recommended non-production alerts:

- `simulation_failures_total` increases during a validation run.
- `active_virtual_players` stays below 90 percent of the requested player count
  for more than 5 minutes.
- `websocket_connections` drops sharply while a run is active.
- `messages_per_second` is zero while active players are above zero.
- `load-generator` restarts during a run.
- `hpa/load-generator` cannot scale because CPU metrics are unavailable.

Production guardrail:

- Alert when `SIMULATION_ENABLED=true` in production outside an approved load
  test window.
