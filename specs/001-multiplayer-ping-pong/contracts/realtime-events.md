# Realtime Event Contract: Multiplayer Ping Pong

**Protocol Version**: `1.0`
**Transport**: WebSocket over HTTPS (`wss://`)
**Endpoint**: `/ws`

## Envelope

Every realtime message uses a JSON envelope.

```json
{
  "type": "input.paddle",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 42,
  "timestamp": "2026-05-30T12:00:00.000Z",
  "payload": {}
}
```

## Client-to-Server Events

### `session.join`

Attaches a WebSocket connection to an existing online session.

```json
{
  "type": "session.join",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 1,
  "timestamp": "2026-05-30T12:00:00.000Z",
  "payload": {
    "playerToken": "secret-token",
    "lastSeenServerSequence": 120
  }
}
```

Rules:

- `playerToken` must match the session and player side.
- If `lastSeenServerSequence` is stale or missing, the server sends `state.snapshot`.

### `input.paddle`

Updates paddle movement intent.

```json
{
  "type": "input.paddle",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 42,
  "timestamp": "2026-05-30T12:00:01.000Z",
  "payload": {
    "intent": "up",
    "targetY": 0.42
  }
}
```

Rules:

- `intent` is `up`, `down`, `stop`, or `target`.
- `targetY` is normalized from `0` to `1` and required only when `intent` is `target`.
- Events over the configured rate limit are rejected or coalesced.

### `match.pause`

Requests a pause.

```json
{
  "type": "match.pause",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 43,
  "timestamp": "2026-05-30T12:00:02.000Z",
  "payload": {}
}
```

### `match.resume`

Requests resume from pause.

```json
{
  "type": "match.resume",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 44,
  "timestamp": "2026-05-30T12:00:05.000Z",
  "payload": {}
}
```

### `match.restart`

Requests match restart. In online play, v1 accepts restart when both connected players request it or when the non-requesting player accepts the prompt.

```json
{
  "type": "match.restart",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 45,
  "timestamp": "2026-05-30T12:00:10.000Z",
  "payload": {
    "intent": "request"
  }
}
```

### `session.leave`

Ends the player's active participation.

```json
{
  "type": "session.leave",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 46,
  "timestamp": "2026-05-30T12:00:12.000Z",
  "payload": {}
}
```

### `heartbeat`

Keeps the connection alive and measures latency.

```json
{
  "type": "heartbeat",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "playerId": "player_left",
  "sequence": 47,
  "timestamp": "2026-05-30T12:00:15.000Z",
  "payload": {
    "clientNow": 123456789
  }
}
```

## Server-to-Client Events

### `session.ready`

Confirms the connection and assigned side.

```json
{
  "type": "session.ready",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 10,
  "timestamp": "2026-05-30T12:00:00.050Z",
  "payload": {
    "playerId": "player_left",
    "side": "left",
    "status": "waiting",
    "serverTime": "2026-05-30T12:00:00.050Z"
  }
}
```

### `state.snapshot`

Sends complete authoritative state after join, reconnect, or desync.

```json
{
  "type": "state.snapshot",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 121,
  "timestamp": "2026-05-30T12:00:01.000Z",
  "payload": {
    "status": "in_play",
    "score": { "left": 3, "right": 2 },
    "servingSide": "right",
    "ball": { "x": 0.5, "y": 0.5, "vx": 0.7, "vy": -0.2, "speed": 1.1 },
    "paddles": {
      "left": { "y": 0.4, "height": 0.18 },
      "right": { "y": 0.55, "height": 0.18 }
    },
    "rallyCount": 5
  }
}
```

### `state.delta`

Sends changed authoritative state fields during play.

```json
{
  "type": "state.delta",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 122,
  "timestamp": "2026-05-30T12:00:01.033Z",
  "payload": {
    "ball": { "x": 0.52, "y": 0.49, "vx": 0.7, "vy": -0.2 },
    "paddles": {
      "left": { "y": 0.39 },
      "right": { "y": 0.55 }
    }
  }
}
```

### `point.scored`

Announces point result.

```json
{
  "type": "point.scored",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 200,
  "timestamp": "2026-05-30T12:00:10.000Z",
  "payload": {
    "scoringSide": "left",
    "score": { "left": 4, "right": 2 },
    "nextServingSide": "right"
  }
}
```

### `match.paused`, `match.resumed`, and `match.ended`

Status events share the same envelope and include the acting player where applicable.

```json
{
  "type": "match.ended",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 300,
  "timestamp": "2026-05-30T12:05:00.000Z",
  "payload": {
    "winner": "left",
    "finalScore": { "left": 11, "right": 8 },
    "reason": "target_score"
  }
}
```

### `player.disconnected` and `player.reconnected`

Reports transient connection state.

```json
{
  "type": "player.disconnected",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 250,
  "timestamp": "2026-05-30T12:03:00.000Z",
  "payload": {
    "playerId": "player_right",
    "reconnectDeadline": "2026-05-30T12:03:30.000Z"
  }
}
```

### `error`

Reports recoverable or terminal errors.

```json
{
  "type": "error",
  "protocolVersion": "1.0",
  "sessionId": "sess_123",
  "sequence": 251,
  "timestamp": "2026-05-30T12:03:01.000Z",
  "payload": {
    "code": "INPUT_REJECTED",
    "message": "Input was outside allowed paddle bounds.",
    "retryable": true
  }
}
```

## Close Codes

- `1000`: Normal close.
- `1008`: Policy violation, including invalid token or origin.
- `1011`: Server error.
- `4001`: Unsupported protocol version.
- `4002`: Session expired.
- `4003`: Session full.
- `4004`: Rate limit exceeded.

## Compatibility Rules

- Clients must send `protocolVersion`.
- Servers may reject unsupported versions with `4001`.
- Additive payload fields are allowed.
- Removing or renaming event fields requires a new protocol version.
