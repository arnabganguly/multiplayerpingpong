# Browser Ping Pong on AKS

Responsive browser Ping Pong with single-player AI, local two-player, invite-only
online play, and Azure Kubernetes Service deployment assets.

## Local Development

```bash
npm install
SESSION_TOKEN_SIGNING_SECRET=local-dev-secret npm run dev --workspace @pingpong/realtime
```

In a second terminal:

```bash
npm run dev --workspace @pingpong/web
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend HTTP: `http://localhost:8080/api`
- Backend WebSocket: `ws://localhost:8080/ws`

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

See `specs/001-multiplayer-ping-pong/quickstart.md` for the full local,
container, and AKS workflow.
