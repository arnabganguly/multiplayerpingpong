# Simulation HPA Validation

## Prerequisites

- Non-production Kubernetes cluster with ingress working.
- `load-generator` deployment rolled out.
- Metrics Server installed for CPU-based HPA.
- `SIMULATION_ADMIN_TOKEN` available to the operator.

## Run

```bash
export SIMULATOR_API_URL=https://<host>/api/simulator
export SIMULATION_ADMIN_TOKEN=<admin-token>
npm run perf:simulation
```

In another terminal:

```bash
watch kubectl -n pingpong get hpa,pods
npm run perf:simulation:hpa
```

## Acceptance Criteria

- `hpa/load-generator` observes increased CPU during allocation and gameplay.
- `load-generator` scales within its configured min/max replica range.
- Realtime remains at its configured active-session owner count.
- Admin dashboard and `/metrics` show active players, matches, connections, and
  message rate during the run.
- A control online match remains playable while the simulator is active.

## Evidence To Save

- `kubectl -n pingpong get hpa load-generator -o yaml`
- `kubectl -n pingpong get pods -l app.kubernetes.io/name=load-generator -o wide`
- Simulator `/metrics` output before, during, and after the run.
- Admin status response from `/api/simulator/status`.
