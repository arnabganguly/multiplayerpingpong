# Release Evidence

## Local Gates

- `npm run lint`: PASS
- `npm run format`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS, 11 files and 28 tests
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 16 browser tests across desktop and mobile Chromium

## Environment Notes

- `npm install` required network approval and completed successfully.
- Playwright Chromium was installed with `npx playwright install chromium`.
- Docker is not installed in this environment, so image build smoke tests were not executed locally.
- kubectl is not installed in this environment, so Kustomize/AKS smoke checks were not executed locally.

## Remaining Release Evidence Required In CI/AKS

- Docker image builds for `apps/web/Dockerfile` and `apps/realtime/Dockerfile`.
- Kustomize or kubeconform validation for all overlays.
- AKS deployment smoke tests through public HTTPS/WSS ingress.
- WebSocket load test for 100 concurrent online matches.
- Security abuse script against deployed/staging backend.
