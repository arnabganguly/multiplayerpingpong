# Operations Dashboard

Create an Azure Monitor workbook or dashboard with these panels:

- Active sessions: `pingpong_active_sessions`
- Connected players: `pingpong_connected_players`
- Tick health: `pingpong_match_tick_duration_ms`
- Input rejections: `pingpong_input_rejections_total`
- Disconnects and reconnects: `pingpong_disconnects_total`, `pingpong_reconnects_total`
- Kubernetes health: pod restarts, CPU, memory, readiness failures
- HTTP health: `/api/health/live`, `/api/health/ready`, request rate, error rate

Logs should be queried by `sessionId`, `playerId`, and `correlationId`. Player
tokens and secret values must appear only as `[REDACTED]`.
