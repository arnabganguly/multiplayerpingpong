# Quickstart: Virtual Player Simulator

## Local Development

Install dependencies:

```bash
npm install
```

Run the realtime backend:

```bash
SESSION_TOKEN_SIGNING_SECRET=local-dev-secret npm run dev --workspace @pingpong/realtime
```

Run the simulator service in another terminal:

```bash
SIMULATION_ENABLED=true \
SIMULATION_ADMIN_TOKEN=local-admin-token \
SIMULATION_TARGET_BASE_URL=http://localhost:5173 \
SIMULATION_TARGET_API_URL=http://localhost:8080/api \
SIMULATION_TARGET_REALTIME_URL=ws://localhost:8080/ws \
npm run dev --workspace @pingpong/simulator
```

Run the web app in another terminal:

```bash
npm run dev --workspace @pingpong/web
```

Open the web app and navigate to the admin simulation panel:

```text
http://localhost:5173
```

Use `local-admin-token` when prompted for local admin access.

## 100-Player Smoke Simulation

Start a 100-player run from the admin UI with:

```text
Virtual players: 100
Matches: 50
Duration: 300 seconds
Behavior profile: balanced
Update frequency: 10 Hz
Disconnect rate: 0
Reconnect rate: 0
```

Expected result:

- Status changes to running within 15 seconds.
- Active virtual players approaches 100.
- Active simulated matches approaches 50.
- Metrics expose non-zero WebSocket connections and message activity.
- Stop closes at least 95% of connections within 60 seconds.

## 1,000-Player Cluster Validation

Deploy to a non-production Kubernetes environment before running this test.

Start a 1,000-player run from the admin UI with:

```text
Virtual players: 1000
Matches: 500
Duration: 900 seconds
Behavior profile: balanced
Update frequency: 10 Hz
Disconnect rate: 1
Reconnect rate: 1
```

Collect evidence:

```bash
kubectl -n pingpong get pods
kubectl -n pingpong get hpa
kubectl -n pingpong describe hpa load-generator
kubectl -n pingpong logs deploy/load-generator --tail=200
```

Expected result:

- Simulator HPA responds according to configured thresholds.
- The simulator reports 1,000 active virtual players during steady state.
- Metrics stay within 10% of the run summary.
- Realtime gameplay control sessions preserve correct scoring and state.

## Kubernetes Deployment Notes

The simulator runs as a separate workload:

```text
Deployment: load-generator
Deployment: load-generator
Service: load-generator-api
HPA: load-generator
```

Required runtime configuration:

```text
SIMULATION_ENABLED=false by default in production
SIMULATION_ADMIN_TOKEN=<secret>
SIMULATION_TARGET_BASE_URL=<public app URL>
SIMULATION_TARGET_API_URL=<public /api URL>
SIMULATION_TARGET_REALTIME_URL=<public /ws URL>
SIMULATION_MAX_VIRTUAL_PLAYERS=1000
SIMULATION_MAX_DURATION_SECONDS=1800
SIMULATION_MAX_UPDATE_FREQUENCY_HZ=20
```

Ingress routing must preserve:

```text
/                    -> pingpong-web
/api                 -> pingpong-realtime
/ws                  -> pingpong-realtime
/api/simulator       -> load-generator-api
/admin/simulations   -> load-generator-api
```

Behavior profiles:

- `balanced`: baseline smoke and acceptance validation.
- `aggressive`: faster tracking with fewer mistakes.
- `defensive`: slower tracking with lower mistake rate.
- `erratic`: higher movement variance and mistake rate.

Reconnect examples:

- Stable baseline: disconnect `0`, reconnect `0`.
- Mild churn: disconnect `1`, reconnect `1`.
- Recovery stress: disconnect `5`, reconnect `5`.

## Release Gates

- Admin UI denies non-admin access.
- Production simulation controls are disabled unless explicitly enabled.
- 100-player UI flow passes.
- 1,000-player cluster validation evidence is recorded.
- Metrics contract is verified.
- Real gameplay control session remains correct during simulation load.
