# Simulation Release Evidence

## Build And Quality

- `npm install`: PASS
- `npm run format`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS, 23 files and 53 tests
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 22 browser tests
- `npm audit --omit=dev`: PASS

## Container And Kubernetes

- `docker build -f apps/simulator/Dockerfile -t load-generator:<tag> .`: NOT RUN,
  Docker is not installed locally.
- `npm run smoke:k8s:simulator`: PASS
- `kubectl -n pingpong rollout status deploy/load-generator`: NOT RUN, requires
  AKS/EKS cluster access.

## Functional Validation

- Admin UI unlocks with `SIMULATION_ADMIN_TOKEN`: PASS in Playwright.
- 100-player run starts and stops: PASS locally.
- 1,000-player run reaches target threshold: NOT RUN locally.
- Production-disabled start request returns 403: PASS in automated tests.
- Non-admin request returns 401: PASS in automated tests.

## Operations Validation

- `/metrics` exposes required simulator metrics: PASS locally and in contract tests.
- `hpa/load-generator` responds to increased load: NOT RUN locally.
- Realtime control match remains playable during simulation: covered by simulator
  integration and Playwright smoke; full cluster evidence still required.
- Run cleanup returns active players, matches, and connections to zero: PASS in
  100-player smoke stop path.
