# Data Model: Virtual Player Simulation and Cluster Load Testing

## SimulationRun

Represents one administrator-requested load simulation.

**Fields**:

- `runId`: stable run identifier.
- `status`: `requested`, `starting`, `running`, `stopping`, `completed`, or `failed`.
- `configuration`: associated `SimulationConfiguration`.
- `createdAt`: time the run was requested.
- `startedAt`: time virtual player orchestration began.
- `stoppedAt`: time stop was requested or completion occurred.
- `expiresAt`: expected automatic end time based on duration.
- `summary`: latest `SimulationRunSummary`.
- `lastError`: most recent failure message, if any.

**Relationships**:

- Has one `SimulationConfiguration`.
- Has many `VirtualPlayer`.
- Has many `SimulatedMatch`.
- Produces one or more `SimulationMetricSample`.

**Validation rules**:

- Only one active run may be in `starting`, `running`, or `stopping` for MVP.
- A run cannot move from a terminal state back to active.
- A run must stop when its duration expires.

**State transitions**:

```text
requested -> starting -> running -> stopping -> completed
requested -> failed
starting -> failed
running -> failed
running -> completed
stopping -> failed
```

## SimulationConfiguration

Administrator-selected settings for a simulation run.

**Fields**:

- `virtualPlayers`: requested number of concurrent virtual players.
- `matches`: requested number of simulated matches.
- `durationSeconds`: maximum run duration.
- `behaviorProfile`: `balanced`, `aggressive`, `defensive`, or `erratic`.
- `updateFrequencyHz`: target paddle update frequency per virtual player.
- `disconnectRatePerMinute`: percentage or rate of virtual players that disconnect per minute.
- `reconnectRatePerMinute`: percentage or rate of disconnected virtual players that reconnect per minute.
- `seed`: optional deterministic seed for repeatable behavior.

**Validation rules**:

- `virtualPlayers` must be between 1 and 1,000 for MVP.
- `matches` must be at least 1 and no greater than `ceil(virtualPlayers / 2)`.
- `durationSeconds` must be positive and within the environment's maximum allowed duration.
- `updateFrequencyHz` must be positive and capped to prevent unbounded message volume.
- Disconnect and reconnect rates must be non-negative and within environment limits.
- Production requests are rejected unless simulation enablement is explicit.

## VirtualPlayer

A simulated participant that behaves like an external player.

**Fields**:

- `virtualPlayerId`: stable virtual player identifier within a run.
- `runId`: owning simulation run.
- `matchId`: assigned simulated match.
- `sessionId`: public gameplay session id after match creation/join.
- `playerId`: gameplay player id returned by the session service.
- `side`: left or right side in the simulated match.
- `state`: `allocated`, `joining`, `connected`, `playing`, `disconnecting`, `reconnecting`, `stopped`, or `failed`.
- `behaviorProfile`: behavior profile inherited from the run or overridden internally.
- `lastInputAt`: last paddle input time.
- `lastStateSequence`: last received realtime state sequence.
- `failureReason`: error detail when failed.

**Relationships**:

- Belongs to one `SimulationRun`.
- Belongs to one `SimulatedMatch`.
- Owns at most one active WebSocket connection.

**Validation rules**:

- A virtual player must obtain session credentials through normal session create/join before opening a realtime connection.
- A virtual player must not send input before the realtime join is accepted.
- A virtual player must close its connection when the run stops or completes.

## SimulatedMatch

A match created for load testing.

**Fields**:

- `simulatedMatchId`: stable identifier within the run.
- `runId`: owning simulation run.
- `sessionId`: public gameplay session id.
- `joinCode`: gameplay join code.
- `state`: `creating`, `waiting_for_players`, `active`, `completed`, or `failed`.
- `leftVirtualPlayerId`: assigned left player.
- `rightVirtualPlayerId`: assigned right player, if allocated.
- `score`: latest observed score.
- `lastStateAt`: last state update time.

**Relationships**:

- Belongs to one `SimulationRun`.
- Has one or two `VirtualPlayer` records.

**Validation rules**:

- A simulated match should not include real human players.
- A simulated match is failed if either required virtual player cannot join before startup timeout.

## BehaviorProfile

Controls virtual paddle behavior.

**Fields**:

- `name`: profile identifier.
- `reactionDelayMs`: target delay before responding to ball state.
- `targetingAccuracy`: how closely paddle movement follows the ball.
- `movementVariance`: bounded randomness applied to movement.
- `mistakeRate`: likelihood of intentionally imperfect movement.

**Validation rules**:

- Profile values must stay within safe bounds that keep input volume and gameplay behavior realistic.
- Profiles must be deterministic when a run seed is supplied.

## SimulationRunSummary

Latest status snapshot returned to the UI.

**Fields**:

- `runId`
- `status`
- `activeVirtualPlayers`
- `activeSimulatedMatches`
- `websocketConnections`
- `messagesPerSecond`
- `failures`
- `elapsedSeconds`
- `remainingSeconds`
- `createdAt`
- `startedAt`
- `stoppedAt`
- `lastError`

**Validation rules**:

- Active counts must never be negative.
- Remaining time must be zero for terminal runs.
- Summary values must be derived from tracked lifecycle state, not only logs.

## SimulationMetricSample

Operational measurement exposed for monitoring.

**Fields**:

- `active_virtual_players`
- `active_simulated_matches`
- `websocket_connections`
- `messages_per_second`
- `simulation_runs_total`
- `simulation_failures_total`

**Validation rules**:

- Metric names must match the specification exactly.
- High-cardinality labels such as player id, session id, or run id must not be used in default metrics.
- Metric values must be Prometheus-compatible numbers.

## Administrator

Authorized user or operator controlling simulations.

**Fields**:

- `isAuthorized`: whether the current request is allowed to manage simulations.
- `environment`: active deployment environment.

**Validation rules**:

- Non-administrators cannot create, stop, or view simulation details.
- Production access is denied unless simulation enablement is explicit.
