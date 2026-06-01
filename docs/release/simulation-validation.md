# Simulation Validation

Use this file to record validation results for the Virtual Player Simulator.

## Automated Checks

- `npm install`: PASS
- `npm run format`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS, 23 files and 53 tests
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 22 browser tests across desktop and mobile Chromium
- `npm audit --omit=dev`: PASS, 0 production vulnerabilities
- `npm run smoke:k8s:simulator`: PASS for `infra/k8s/overlays/dev`

## Load Checks

- `npm run smoke:simulation`: PASS locally with 100 virtual players, 50 matches,
  100 WebSocket connections, and 0 failures.
- `npm run smoke:simulation:metrics`: PASS locally.
- `npm run perf:simulation`: NOT RUN locally; requires a non-production
  Kubernetes cluster sized for 1,000 virtual players.
- `npm run perf:simulation:hpa`: NOT RUN locally; requires Metrics Server and
  live `hpa/load-generator` evidence from AKS/EKS.

## Security Checks

- Unauthorized `/api/simulator/status` returns 401: PASS in automated tests.
- Production-disabled `/api/simulator/start` returns 403: PASS in automated tests.
- No tokens appear in simulator logs: PASS by inspection of smoke output.

## Local Environment Notes

- Docker is not installed locally, so simulator image build validation remains a
  CI/cluster task.
- 1,000-player and HPA validation are documented in
  `docs/operations/simulation-hpa-validation.md`.
