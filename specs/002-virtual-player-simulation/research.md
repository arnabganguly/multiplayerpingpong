# Research: Virtual Player Simulation and Cluster Load Testing

## Decision: Implement the load generator as `apps/simulator`

**Rationale**: The feature requires simulation workloads to be independently scalable and deployable. A separate workspace service isolates load-generation resource usage from gameplay ownership and lets Kubernetes scale simulator pods without changing the web or realtime deployments.

**Alternatives considered**:

- Embed simulation in `apps/realtime`: rejected because load generation could compete with authoritative gameplay loops and violate the requirement that simulation must not affect gameplay correctness.
- Add browser-only simulation in the admin UI: rejected because 1,000 concurrent virtual players cannot be reliably generated from one browser session and would not validate cluster behavior.
- Use only external scripts under `scripts/perf`: rejected because administrators need UI-driven start/stop/status and Prometheus-visible runs.

## Decision: Virtual players use public session and WebSocket paths

**Rationale**: The core acceptance criterion is that simulated players use the same communication paths as real users. The simulator will create sessions, join sessions, connect to returned WebSocket URLs, send paddle inputs, receive state updates, and disconnect or reconnect as an external client would.

**Alternatives considered**:

- Directly call internal realtime service classes: rejected because it would bypass HTTP/WebSocket routing, ingress behavior, auth/token handling, and protocol validation.
- Inject state directly into the game engine: rejected because it would not validate production communication paths or gameplay correctness under real traffic.

## Decision: Use an administrator token for MVP access control

**Rationale**: The current application does not have full user accounts. A runtime-provided administrator token gives immediate protection for non-production simulation controls, supports production-disabled-by-default behavior, and keeps the feature small enough for MVP. The plan preserves a future replacement with the project's eventual identity provider.

**Alternatives considered**:

- Build full user authentication first: rejected as too broad for this milestone and not required to validate simulator load.
- Leave admin UI hidden by route only: rejected because it would not satisfy non-administrator denial requirements.

## Decision: One active simulation run per environment for MVP

**Rationale**: A single active run simplifies operator control, metrics interpretation, cleanup, and overload prevention while still satisfying the 100-player and 1,000-player acceptance criteria.

**Alternatives considered**:

- Unlimited concurrent runs: rejected because accidental overlapping runs could overload the cluster and make metrics ambiguous.
- Per-admin isolated runs: deferred until user accounts and durable run ownership exist.

## Decision: In-memory simulation coordination for MVP

**Rationale**: MVP requires one active run and up to 1,000 virtual players. In-memory run state is consistent with the existing lightweight architecture and avoids adding a database before durable history or multi-run scheduling is required.

**Alternatives considered**:

- PostgreSQL or document database for run persistence: rejected because durable history is not required by the MVP acceptance criteria.
- Distributed queue for worker coordination: deferred for the 10,000+ player expansion path.

## Decision: Simulator HPA validates independent scaling

**Rationale**: Existing realtime match ownership is intentionally single-replica while sessions are stored in memory. For MVP, HPA validation should prove the simulator workload can scale independently and that the cluster behaves safely under generated load. Realtime backend capacity is validated through sustained load and resource sizing, not multi-replica active-session ownership.

**Alternatives considered**:

- Raise realtime backend HPA above one replica: rejected because active sessions are in memory and routing could break reconnects or match continuity.
- Skip HPA validation until distributed realtime state exists: rejected because the milestone explicitly includes HPA validation testing.

## Decision: Prometheus-compatible text metrics exposed by simulator

**Rationale**: The spec names explicit metrics and requires Prometheus visibility. Text exposition keeps the simulator interoperable with Prometheus-compatible scrapers and matches the existing operations direction.

**Alternatives considered**:

- UI-only status polling: rejected because operators need metrics in monitoring.
- Logs-only summaries: rejected because logs do not provide straightforward active gauges and rate counters for HPA/load validation.

## Decision: Behavior profiles are deterministic with bounded randomness

**Rationale**: Operators need realistic traffic, but tests need repeatability. Profiles should use configurable random seeds where useful and bounded input behavior so simulations can be reproduced during debugging.

**Alternatives considered**:

- Fully random movement: rejected because failures become difficult to reproduce.
- Perfect AI movement only: rejected because it does not create realistic scoring, rally, disconnect, or reconnect behavior.
