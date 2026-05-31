# Incident Runbook

## First Checks

```bash
kubectl get pods -n pingpong
kubectl get ingress -n pingpong
kubectl logs -n pingpong deploy/pingpong-realtime
kubectl logs -n pingpong deploy/pingpong-web
```

## Common Symptoms

- Realtime readiness failures: check missing `SESSION_TOKEN_SIGNING_SECRET`,
  high active sessions, or pod restarts.
- WebSocket failures: verify ingress `/ws` routing and idle timeout annotations.
- High latency: check `pingpong_match_tick_duration_ms`, CPU, and active session count.
- Token errors: confirm the Key Vault/Kubernetes secret is mounted and logs are redacted.

## Rollback

```bash
kubectl rollout undo deploy/pingpong-realtime -n pingpong
kubectl rollout undo deploy/pingpong-web -n pingpong
kubectl rollout status deploy/pingpong-realtime -n pingpong
kubectl rollout status deploy/pingpong-web -n pingpong
```

## Escalation Data

Capture deployment SHA, namespace events, pod restarts, `/metrics` output, and
session/correlation identifiers from structured logs. Do not copy player tokens.
