# Production Smoke Test

1. Open the HTTPS ingress URL.
2. Start a single-player match, pause, resume, restart, and exit.
3. Start a local two-player match and move both paddles.
4. Create an online session and copy the join code/link.
5. Join from a second browser and verify both clients enter the match.
6. Move both paddles and verify score/state updates.
7. Refresh one browser and reconnect within 30 seconds.
8. Check `/api/health/live`, `/api/health/ready`, and `/metrics`.
9. Confirm logs include session lifecycle events and redact token fields.
10. Roll back one deployment in staging and verify readiness/drain behavior.
