# Simulation Metrics

The load generator exposes Prometheus text metrics at `/metrics`.

Required metrics:

- `active_virtual_players`
- `active_simulated_matches`
- `websocket_connections`
- `messages_per_second`
- `simulation_runs_total`
- `simulation_failures_total`

These metrics intentionally avoid run ids, player ids, session ids, and tokens
as labels to prevent high-cardinality series and accidental secret exposure.

Smoke check:

```bash
export SIMULATOR_BASE_URL=https://<host>
npm run smoke:simulation:metrics
```
