# Alert Rules

Recommended release-blocking alerts:

- Elevated HTTP 5xx rate for `pingpong-realtime` for 5 minutes.
- Repeated readiness failures for either deployment.
- `pingpong_match_tick_duration_ms` above the 30 Hz frame budget for 5 minutes.
- High disconnect rate or reconnect success below the release target.
- `pingpong_active_sessions` approaching `MAX_SESSIONS_PER_BACKEND`.
- Pod restarts above zero during a rollout window.
- Missing metrics scrape for `/metrics`.

Alert actions should include the AKS runbook, current deployment SHA, and links
to logs filtered by workload and namespace.
