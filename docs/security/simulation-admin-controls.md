# Simulation Admin Controls

The simulator API is protected by `SIMULATION_ADMIN_TOKEN`. The web UI sends the
token as `Authorization: Bearer <token>` to `/api/simulator/*`.

Security checklist:

- Store `SIMULATION_ADMIN_TOKEN` only in Kubernetes secrets or the CI/CD secret
  store.
- Keep `SIMULATION_ENABLED=false` by default in production overlays.
- Rotate the token after shared load-test windows.
- Do not log request headers or player tokens.
- Restrict ingress access to simulator routes when a private admin network or
  identity-aware proxy is available.
- Treat 1,000-player runs as non-production operations unless explicitly
  approved.
