# Browser Ping Pong on Kubernetes

Responsive browser Ping Pong with single-player AI, local two-player, invite-only
online play, and Kubernetes deployment assets for Azure Kubernetes Service
and Amazon Elastic Kubernetes Service.

## Local Development

```bash
npm install
SESSION_TOKEN_SIGNING_SECRET=local-dev-secret npm run dev --workspace @pingpong/realtime
```

In a second terminal:

```bash
npm run dev --workspace @pingpong/web
```

In a third terminal, start the load simulator API:

```bash
SIMULATION_ADMIN_TOKEN=local-admin-token npm run dev:simulator
```

Or use the local helper script to install dependencies and start all services:

```bash
npm run dev:local
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend HTTP: `http://localhost:8080/api`
- Backend WebSocket: `ws://localhost:8080/ws`
- Simulator API: `http://localhost:8090/api/simulator`
- Admin UI: `http://localhost:5173`, then `Admin` → `Load Testing`

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Configuration

Frontend:

```text
PUBLIC_BASE_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:8080/api
PUBLIC_REALTIME_URL=ws://localhost:8080/ws
```

Backend:

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

Load simulator:

```text
APP_ENV=local
PORT=8090
SIMULATION_ENABLED=true
SIMULATION_ADMIN_TOKEN=local-admin-token
SIMULATION_TARGET_BASE_URL=http://localhost:5173
SIMULATION_TARGET_API_URL=http://localhost:8080/api
SIMULATION_TARGET_REALTIME_URL=ws://localhost:8080/ws
SIMULATION_MAX_VIRTUAL_PLAYERS=1000
```

## Kubernetes Deployment Model

The Kubernetes manifests run the frontend and backend as separate workloads:

- `pingpong-web`: React/Vite static frontend served by nginx
- `pingpong-realtime`: Fastify HTTP and WebSocket backend
- `load-generator`: simulator API and WebSocket bot clients

Ingress routes `/` to `pingpong-web`, `/api` plus `/ws` to
`pingpong-realtime`, and `/api/simulator` plus `/admin/simulations` to
`load-generator-api`. The realtime backend is intentionally capped at one
replica in v1 because online sessions are stored in pod memory. The load
generator is independently scalable with its own HPA.

## Deploy To AKS

Prerequisites:

- Azure CLI logged in with `az login`
- `kubectl`
- `helm`
- `openssl`

Set deployment names. `PINGPONG_ACR_NAME` must be globally unique.

```bash
export PINGPONG_RESOURCE_GROUP=rg-pingpong-dev
export PINGPONG_LOCATION=westus2
export PINGPONG_ACR_NAME=<globally-unique-acr-name>
export PINGPONG_AKS_NAME=aks-pingpong-dev
```

Create ACR and AKS, attach ACR to AKS, and load AKS credentials:

```bash
bash infra/azure/acr.sh
bash infra/azure/aks.sh
```

Build and push both images with ACR Tasks:

```bash
export ACR_LOGIN_SERVER=$(az acr show \
  --resource-group "$PINGPONG_RESOURCE_GROUP" \
  --name "$PINGPONG_ACR_NAME" \
  --query loginServer \
  --output tsv)

az acr build \
  --registry "$PINGPONG_ACR_NAME" \
  --image pingpong-web:dev \
  --file apps/web/Dockerfile .

az acr build \
  --registry "$PINGPONG_ACR_NAME" \
  --image pingpong-realtime:dev \
  --file apps/realtime/Dockerfile .

az acr build \
  --registry "$PINGPONG_ACR_NAME" \
  --image load-generator:dev \
  --file apps/simulator/Dockerfile .
```

Install ingress-nginx:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-basic \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz
```

Create the app secret and deploy the manifests:

```bash
kubectl create namespace pingpong --dry-run=client -o yaml | kubectl apply -f -

kubectl -n pingpong create secret generic pingpong-secrets \
  --from-literal=SESSION_TOKEN_SIGNING_SECRET="$(openssl rand -base64 32)" \
  --from-literal=SIMULATION_ADMIN_TOKEN="$(openssl rand -base64 32)" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -k infra/k8s/overlays/dev
```

Point the two deployments at the ACR images:

```bash
kubectl -n pingpong set image deploy/pingpong-web \
  web="${ACR_LOGIN_SERVER}/pingpong-web:dev"

kubectl -n pingpong set image deploy/pingpong-realtime \
  realtime="${ACR_LOGIN_SERVER}/pingpong-realtime:dev"

kubectl -n pingpong set image deploy/load-generator \
  load-generator="${ACR_LOGIN_SERVER}/load-generator:dev"
```

Use the ingress public IP as a temporary HTTP host:

```bash
export INGRESS_IP=$(kubectl -n ingress-basic get svc ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

export PINGPONG_HOST="pingpong.${INGRESS_IP}.nip.io"

kubectl -n pingpong patch ingress pingpong --type=json \
  -p="[
    {\"op\":\"replace\",\"path\":\"/spec/rules/0/host\",\"value\":\"${PINGPONG_HOST}\"},
    {\"op\":\"remove\",\"path\":\"/spec/tls\"}
  ]"

kubectl -n pingpong set env deploy/pingpong-realtime \
  PUBLIC_BASE_URL="http://${PINGPONG_HOST}" \
  PUBLIC_REALTIME_URL="ws://${PINGPONG_HOST}/ws" \
  ALLOWED_ORIGINS="http://${PINGPONG_HOST}"

kubectl -n pingpong set env deploy/load-generator \
  SIMULATION_ENABLED=true \
  SIMULATION_TARGET_BASE_URL="http://${PINGPONG_HOST}" \
  SIMULATION_TARGET_API_URL="http://${PINGPONG_HOST}/api" \
  SIMULATION_TARGET_REALTIME_URL="ws://${PINGPONG_HOST}/ws"
```

Verify and open the game:

```bash
kubectl -n pingpong rollout status deploy/pingpong-web
kubectl -n pingpong rollout status deploy/pingpong-realtime
kubectl -n pingpong rollout status deploy/load-generator
kubectl -n pingpong get pods,svc,ingress

echo "http://${PINGPONG_HOST}"
```

To validate the simulator after rollout:

```bash
export SIMULATOR_API_URL="http://${PINGPONG_HOST}/api/simulator"
export SIMULATION_ADMIN_TOKEN=<token-used-in-pingpong-secrets>
export SIMULATOR_BASE_URL="http://${PINGPONG_HOST}"
npm run smoke:simulation
npm run smoke:simulation:metrics
kubectl -n pingpong get hpa load-generator
```

## Deploy To EKS

Prerequisites:

- AWS CLI configured with credentials
- `eksctl`
- Docker
- `kubectl`
- `helm`
- `openssl`

Set deployment names:

```bash
export AWS_REGION=us-west-2
export EKS_CLUSTER_NAME=pingpong-dev
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
```

Create the EKS cluster:

```bash
eksctl create cluster \
  --name "$EKS_CLUSTER_NAME" \
  --region "$AWS_REGION" \
  --nodes 2 \
  --node-type t3.medium \
  --managed

aws eks update-kubeconfig \
  --name "$EKS_CLUSTER_NAME" \
  --region "$AWS_REGION"
```

Create ECR repositories and push both images:

```bash
aws ecr describe-repositories \
  --repository-names pingpong-web \
  --region "$AWS_REGION" >/dev/null 2>&1 || \
aws ecr create-repository \
  --repository-name pingpong-web \
  --region "$AWS_REGION"

aws ecr describe-repositories \
  --repository-names pingpong-realtime \
  --region "$AWS_REGION" >/dev/null 2>&1 || \
aws ecr create-repository \
  --repository-name pingpong-realtime \
  --region "$AWS_REGION"

aws ecr describe-repositories \
  --repository-names load-generator \
  --region "$AWS_REGION" >/dev/null 2>&1 || \
aws ecr create-repository \
  --repository-name load-generator \
  --region "$AWS_REGION"

aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

docker build \
  -t "${ECR_REGISTRY}/pingpong-web:dev" \
  -f apps/web/Dockerfile .

docker build \
  -t "${ECR_REGISTRY}/pingpong-realtime:dev" \
  -f apps/realtime/Dockerfile .

docker build \
  -t "${ECR_REGISTRY}/load-generator:dev" \
  -f apps/simulator/Dockerfile .

docker push "${ECR_REGISTRY}/pingpong-web:dev"
docker push "${ECR_REGISTRY}/pingpong-realtime:dev"
docker push "${ECR_REGISTRY}/load-generator:dev"
```

Install ingress-nginx:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2
```

Create the app secret and deploy the manifests:

```bash
kubectl create namespace pingpong --dry-run=client -o yaml | kubectl apply -f -

kubectl -n pingpong create secret generic pingpong-secrets \
  --from-literal=SESSION_TOKEN_SIGNING_SECRET="$(openssl rand -base64 32)" \
  --from-literal=SIMULATION_ADMIN_TOKEN="$(openssl rand -base64 32)" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -k infra/k8s/overlays/dev
```

Point the two deployments at the ECR images:

```bash
kubectl -n pingpong set image deploy/pingpong-web \
  web="${ECR_REGISTRY}/pingpong-web:dev"

kubectl -n pingpong set image deploy/pingpong-realtime \
  realtime="${ECR_REGISTRY}/pingpong-realtime:dev"

kubectl -n pingpong set image deploy/load-generator \
  load-generator="${ECR_REGISTRY}/load-generator:dev"
```

Use the AWS load balancer hostname as the temporary HTTP host:

```bash
export PINGPONG_HOST=$(kubectl -n ingress-nginx get svc ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

kubectl -n pingpong patch ingress pingpong --type=json \
  -p="[
    {\"op\":\"replace\",\"path\":\"/spec/rules/0/host\",\"value\":\"${PINGPONG_HOST}\"},
    {\"op\":\"remove\",\"path\":\"/spec/tls\"}
  ]"

kubectl -n pingpong set env deploy/pingpong-realtime \
  PUBLIC_BASE_URL="http://${PINGPONG_HOST}" \
  PUBLIC_REALTIME_URL="ws://${PINGPONG_HOST}/ws" \
  ALLOWED_ORIGINS="http://${PINGPONG_HOST}"

kubectl -n pingpong set env deploy/load-generator \
  SIMULATION_ENABLED=true \
  SIMULATION_TARGET_BASE_URL="http://${PINGPONG_HOST}" \
  SIMULATION_TARGET_API_URL="http://${PINGPONG_HOST}/api" \
  SIMULATION_TARGET_REALTIME_URL="ws://${PINGPONG_HOST}/ws"
```

Verify and open the game:

```bash
kubectl -n pingpong rollout status deploy/pingpong-web
kubectl -n pingpong rollout status deploy/pingpong-realtime
kubectl -n pingpong rollout status deploy/load-generator
kubectl -n pingpong get pods,svc,ingress

echo "http://${PINGPONG_HOST}"
```

If EKS pods show `ImagePullBackOff`, confirm the node IAM role can read from
ECR. `eksctl` managed node groups usually create the needed ECR read access
for same-account private repositories.

## Kubernetes Troubleshooting

- Plain nginx `404 Not Found`: the ingress controller is reachable, but
  `spec.rules[0].host` does not match the browser host. Patch the Ingress host.
- `CreateContainerConfigError`: confirm `pingpong-secrets` exists in the
  `pingpong` namespace.
- `ImagePullBackOff`: confirm the deployment image points at ACR/ECR and the
  cluster can pull from that registry.
- WebSocket fails in online mode: confirm `PUBLIC_REALTIME_URL` uses `ws://`
  for HTTP testing or `wss://` for HTTPS.

For a real domain, replace the temporary host patch with your DNS name and add a
valid TLS secret named `pingpong-tls`, or update the overlay to match your
certificate setup.

Cloud reference docs:

- Azure AKS CLI: https://learn.microsoft.com/en-us/cli/azure/aks
- Azure ACR build: https://learn.microsoft.com/en-us/cli/azure/acr
- Amazon EKS with eksctl: https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html
- Amazon ECR image push: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html
- ingress-nginx install: https://kubernetes.github.io/ingress-nginx/deploy/

See `specs/001-multiplayer-ping-pong/quickstart.md` for the full local,
container, and AKS workflow.
