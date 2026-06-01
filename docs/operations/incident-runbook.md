# Incident Runbook

## First Checks

```bash
kubectl get pods -n pingpong
kubectl get ingress -n pingpong
kubectl logs -n pingpong deploy/pingpong-realtime
kubectl logs -n pingpong deploy/pingpong-web
kubectl logs -n pingpong deploy/load-generator
```

## Common Symptoms

- Realtime readiness failures: check missing `SESSION_TOKEN_SIGNING_SECRET`,
  high active sessions, or pod restarts.
- WebSocket failures: verify ingress `/ws` routing and idle timeout annotations.
- High latency: check `pingpong_match_tick_duration_ms`, CPU, and active session count.
- Token errors: confirm the Key Vault/Kubernetes secret is mounted and logs are redacted.
- Simulator overload: stop active simulations, scale `load-generator` down if
  needed, and confirm realtime gameplay sessions remain correct.

## Stop Simulator Traffic

```bash
export SIMULATOR_API_URL=https://<host>/api/simulator
export SIMULATION_ADMIN_TOKEN=<admin-token>
curl -X POST -H "Authorization: Bearer ${SIMULATION_ADMIN_TOKEN}" \
  "${SIMULATOR_API_URL}/stop"
kubectl scale deploy/load-generator -n pingpong --replicas=0
```

## Rollback

```bash
kubectl rollout undo deploy/pingpong-realtime -n pingpong
kubectl rollout undo deploy/pingpong-web -n pingpong
kubectl rollout undo deploy/load-generator -n pingpong
kubectl rollout status deploy/pingpong-realtime -n pingpong
kubectl rollout status deploy/pingpong-web -n pingpong
kubectl rollout status deploy/load-generator -n pingpong
```

## Escalation Data

Capture deployment SHA, namespace events, pod restarts, realtime `/metrics`,
simulator `/metrics`, HPA state, and session/correlation identifiers from
structured logs. Do not copy player tokens or simulator admin tokens.
