# Data Model: Multiplayer Browser Ping Pong

**Date**: 2026-05-30
**Feature**: Multiplayer Browser Ping Pong

## Entity Overview

The first release does not require durable persistence. These models describe runtime state, shared contract types, and optional future persistence boundaries.

## Player

Represents a human or AI participant in a match.

**Fields**:

- `playerId`: Stable identifier within a session.
- `displayName`: Anonymous label such as `Player 1`, `Player 2`, or `AI`.
- `side`: `left` or `right`.
- `kind`: `human` or `ai`.
- `controlType`: `keyboard`, `touch`, `ai`, or `remote`.
- `connectionState`: `not_applicable`, `connected`, `disconnected`, or `reconnecting`.
- `score`: Non-negative integer.
- `lastInputSequence`: Last accepted client input sequence for online human players.
- `lastSeenAt`: Server timestamp for online human players.

**Validation Rules**:

- `playerId` must be unique within a session.
- Only one active human player may control each side.
- `score` cannot decrease during a match except after restart.
- `lastInputSequence` must increase monotonically per online player.

## Game Session

Represents one local or online match room.

**Fields**:

- `sessionId`: Unique session identifier.
- `mode`: `single_player_ai`, `local_two_player`, or `online_two_player`.
- `joinCode`: Short private code for online sessions.
- `status`: Current match status.
- `players`: One or two player slots.
- `createdAt`: Creation timestamp.
- `expiresAt`: Session expiration timestamp.
- `reconnectDeadline`: Optional timestamp when a disconnected player may still return.
- `targetScore`: Default `11`, configurable by deployment.
- `winBy`: Default `2`.
- `ownerInstanceId`: Backend instance that owns online authoritative state in v1.

**Validation Rules**:

- Online sessions allow at most two active controlling players.
- Expired sessions cannot be joined.
- A join code cannot grant control without a valid player token.
- Online sessions must have `ownerInstanceId`.

## Player Token

Represents an unguessable capability that allows a browser to control one player slot.

**Fields**:

- `tokenId`: Token identifier or signature subject.
- `sessionId`: Session the token belongs to.
- `playerId`: Player slot the token controls.
- `side`: Player side.
- `issuedAt`: Creation timestamp.
- `expiresAt`: Expiration timestamp.

**Validation Rules**:

- Tokens must be signed or otherwise protected from tampering.
- Tokens must not be logged.
- A token must not control another player side or another session.

## Game State

Represents the authoritative simulation state for one tick or snapshot.

**Fields**:

- `sequence`: Monotonic server sequence number.
- `serverTime`: Server timestamp for the state.
- `status`: `waiting`, `serving`, `in_play`, `paused`, `point_scored`, `reconnecting`, `match_ended`, or `restarted`.
- `ball`: Ball position, velocity, radius, and speed tier.
- `paddles`: Left and right paddle positions, dimensions, and velocity/intent.
- `score`: Left and right score.
- `servingSide`: `left` or `right`.
- `rallyCount`: Number of paddle contacts in the current rally.
- `difficultyLevel`: Current AI or rally speed difficulty level.
- `lastPoint`: Optional scoring side and reason.

**Validation Rules**:

- Ball and paddle coordinates must remain within configured court units except during scoring-boundary evaluation.
- Paddle positions must be clamped to legal movement bounds.
- Score changes must occur only on `point_scored` transition.
- `sequence` must increase for every authoritative update.

## Input Event

Represents a client-generated online event.

**Fields**:

- `type`: Event name such as `input.paddle`, `match.pause`, or `match.restart`.
- `protocolVersion`: Contract version used by the client.
- `sessionId`: Target session.
- `playerId`: Sender player.
- `playerToken`: Sender capability token.
- `sequence`: Monotonic client sequence number.
- `clientTime`: Client timestamp.
- `payload`: Event-specific input data.

**Validation Rules**:

- `protocolVersion` must be supported.
- `sessionId`, `playerId`, and `playerToken` must match.
- `sequence` must be greater than the last accepted sequence for the player, with documented tolerance for duplicate retry.
- Paddle input must be within allowed direction/target values.
- Input rate must remain under the configured limit.

## Match Result

Represents the final outcome of a completed match. This remains runtime-only unless match history or leaderboards are enabled later.

**Fields**:

- `sessionId`: Completed session.
- `mode`: Match mode.
- `winnerSide`: `left` or `right`.
- `finalScore`: Left and right final score.
- `reason`: `target_score`, `forfeit`, `restart`, or `server_shutdown`.
- `durationMs`: Match duration.
- `completedAt`: Completion timestamp.

**Validation Rules**:

- A match result exists only after `match_ended`.
- `winnerSide` must match the final score or forfeit rule.
- `durationMs` must be non-negative.

## State Transitions

```text
waiting -> serving
serving -> in_play
in_play -> point_scored
point_scored -> serving
point_scored -> match_ended
in_play -> paused
serving -> paused
paused -> serving
paused -> in_play
in_play -> reconnecting
serving -> reconnecting
paused -> reconnecting
reconnecting -> serving
reconnecting -> in_play
reconnecting -> match_ended
waiting -> restarted
serving -> restarted
in_play -> restarted
paused -> restarted
reconnecting -> restarted
restarted -> serving
```

## Relationships

- A `Game Session` has one or two `Player` records.
- A `Player Token` controls exactly one `Player` in one online `Game Session`.
- A `Game Session` owns one current `Game State`.
- `Input Event` records are processed against one `Game State` and may produce a new `Game State`.
- A terminal `Game Session` may produce one `Match Result`.

## Optional Persistence Extensions

If profiles, history, or leaderboards are added later:

- Add `UserProfile` for authenticated identity and display preferences.
- Store `MatchResult` records in a database after `match_ended`.
- Add leaderboard aggregation with anti-cheat and abuse controls.
- Keep anonymous v1 mode available unless product requirements change.
