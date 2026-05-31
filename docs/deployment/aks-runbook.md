# AKS Deployment Runbook

## Provision

1. Export Azure names and region:

   ```bash
   export PINGPONG_RESOURCE_GROUP=rg-pingpong-dev
   export PINGPONG_LOCATION=westus2
   export PINGPONG_ACR_NAME=<unique-acr-name>
   export PINGPONG_AKS_NAME=aks-pingpong-dev
   export PINGPONG_KEYVAULT_NAME=<unique-keyvault-name>
   ```

2. Create ACR, AKS, and the signing secret:

   ```bash
   infra/azure/acr.sh
   infra/azure/aks.sh
   SESSION_TOKEN_SIGNING_SECRET=<secret-value> infra/azure/keyvault.sh
   ```

## Deploy

```bash
kubectl apply -k infra/k8s/overlays/dev
kubectl rollout status deploy/pingpong-web -n pingpong
kubectl rollout status deploy/pingpong-realtime -n pingpong
```

## Verify

```bash
kubectl get pods -n pingpong
kubectl get ingress -n pingpong
npm run smoke:aks -- --host=https://<host>
```

## Roll Back

```bash
kubectl rollout undo deploy/pingpong-realtime -n pingpong
kubectl rollout undo deploy/pingpong-web -n pingpong
kubectl rollout status deploy/pingpong-realtime -n pingpong
kubectl rollout status deploy/pingpong-web -n pingpong
```

## Capacity Note

Frontend replicas may scale horizontally. The realtime backend is capped at one
active-session owner in v1 because online matches are stored in pod memory.
Add Redis, Azure Web PubSub, or another shared routing layer before raising
backend active-session replicas.
