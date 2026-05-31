# Quickstart: Browser Ping Pong on AKS

This quickstart describes the planned development and deployment workflow for the first implementation.

## Prerequisites

- Node.js LTS and npm.
- Docker or a compatible container builder.
- Azure CLI.
- kubectl.
- Access to an Azure subscription with permission to use AKS, ACR, Key Vault, and Azure Monitor.
- GitHub Actions or an equivalent CI/CD runner with permission to push to ACR and deploy to AKS.

## Local Development

Install dependencies:

```bash
npm install
```

Run all apps locally:

```bash
npm run dev
```

Run frontend only:

```bash
npm run dev --workspace apps/web
```

Run backend only:

```bash
npm run dev --workspace apps/realtime
```

Run quality checks:

```bash
npm run lint
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend HTTP: `http://localhost:8080/api`
- Backend WebSocket: `ws://localhost:8080/ws`

## Environment Variables

Frontend runtime/build settings:

```text
PUBLIC_BASE_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:8080/api
PUBLIC_REALTIME_URL=ws://localhost:8080/ws
```

Backend settings:

```text
APP_ENV=local
ALLOWED_ORIGINS=http://localhost:5173
SESSION_TTL_SECONDS=900
RECONNECT_GRACE_SECONDS=30
DEFAULT_TARGET_SCORE=11
MAX_BALL_SPEED=2.0
ONLINE_TICK_RATE=30
MAX_SESSIONS_PER_BACKEND=100
LOG_LEVEL=debug
METRICS_ENABLED=true
SESSION_TOKEN_SIGNING_SECRET=local-dev-secret
```

## Container Build

Build frontend image:

```bash
docker build -f apps/web/Dockerfile -t pingpong-web:local .
```

Build backend image:

```bash
docker build -f apps/realtime/Dockerfile -t pingpong-realtime:local .
```

Run backend container locally:

```bash
docker run --rm -p 8080:8080 \
  -e APP_ENV=local \
  -e ALLOWED_ORIGINS=http://localhost:5173 \
  -e SESSION_TOKEN_SIGNING_SECRET=local-dev-secret \
  pingpong-realtime:local
```

## AKS Deployment Workflow

Create or select Azure resources:

```bash
az group create --name <resource-group> --location <region>
az acr create --resource-group <resource-group> --name <acr-name> --sku Basic
az aks create \
  --resource-group <resource-group> \
  --name <aks-name> \
  --node-count 2 \
  --attach-acr <acr-name> \
  --enable-addons azure-keyvault-secrets-provider
```

Get cluster credentials:

```bash
az aks get-credentials --resource-group <resource-group> --name <aks-name>
```

Build and push images from CI:

```bash
docker tag pingpong-web:local <acr-name>.azurecr.io/pingpong-web:<git-sha>
docker tag pingpong-realtime:local <acr-name>.azurecr.io/pingpong-realtime:<git-sha>
docker push <acr-name>.azurecr.io/pingpong-web:<git-sha>
docker push <acr-name>.azurecr.io/pingpong-realtime:<git-sha>
```

Deploy dev overlay:

```bash
kubectl apply -k infra/k8s/overlays/dev
kubectl rollout status deploy/pingpong-web -n pingpong
kubectl rollout status deploy/pingpong-realtime -n pingpong
```

Run smoke checks:

```bash
kubectl get pods -n pingpong
kubectl get ingress -n pingpong
npm run smoke:aks
```

Promote the same image tags to staging and production-style overlays after tests pass:

```bash
kubectl apply -k infra/k8s/overlays/staging
kubectl apply -k infra/k8s/overlays/prod
```

## CI/CD Gates

Pull requests:

- Install dependencies.
- Lint and format check.
- Type check.
- Unit tests.
- Contract tests.
- Frontend build.
- Backend build.
- Container build smoke test.

Main branch:

- All pull request gates.
- Build immutable images.
- Scan dependencies and images.
- Push images to ACR.
- Deploy to dev.
- Run deployment smoke tests.

Staging promotion:

- Dev smoke tests pass.
- E2E tests pass against deployed dev.
- Basic load test passes.
- Manual approval.

Production-style promotion:

- Staging smoke and load tests pass.
- Security checks pass.
- Observability dashboard shows healthy baseline.
- Rollback plan is confirmed.

## Operational Checks

Verify health:

```bash
curl https://<host>/api/health/live
curl https://<host>/api/health/ready
```

Verify WebSocket path:

```bash
npm run smoke:websocket -- --url wss://<host>/ws
```

Check logs:

```bash
kubectl logs -n pingpong deploy/pingpong-realtime
kubectl logs -n pingpong deploy/pingpong-web
```

Rollback:

```bash
kubectl rollout undo deploy/pingpong-realtime -n pingpong
kubectl rollout undo deploy/pingpong-web -n pingpong
```

## Release Smoke Test

1. Open the public HTTPS URL.
2. Start and complete a single-player match.
3. Start and complete a local two-player match.
4. Create an online session in one browser.
5. Join from a second browser using the join link.
6. Verify synchronized play, pause/resume, restart, scoring, and match end.
7. Refresh one browser during the match and verify reconnect within 30 seconds.
8. Confirm logs and metrics include the session lifecycle without exposing tokens.
