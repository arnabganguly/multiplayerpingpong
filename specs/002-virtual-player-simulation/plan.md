# Implementation Plan: Virtual Player Simulation and Cluster Load Testing

**Branch**: `002-virtual-player-simulation` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-virtual-player-simulation/spec.md`

**Plan Status**: Ready for Phase 2 task generation

## Summary

Deliver a Virtual Player Simulator milestone that lets administrators start, stop, configure, and observe multiplayer load simulations from the web UI. The simulator runs as an independently deployable service and creates virtual players that connect through the same public session and WebSocket paths used by real players. The milestone includes the simulator service, admin UI, metrics integration, Kubernetes deployment, and HPA validation testing.

The implementation extends the current TypeScript monorepo with `apps/simulator`, adds simulation admin contracts to `packages/contracts`, adds a guarded admin panel to `apps/web`, and adds Kubernetes manifests for simulator deployment, service, config, secrets, metrics, and HPA. MVP supports 1,000 concurrent virtual players in non-production environments while keeping production disabled by default.

## Technical Context

**Language/Version**: TypeScript across simulator service, admin UI, contracts, and tests. Continue using the project's current Node.js LTS target.

**Primary Dependencies**: Existing React/Vite frontend, Fastify-style HTTP service patterns, `ws`-compatible WebSocket client behavior, shared `@pingpong/contracts`, shared `@pingpong/game-core` for input behavior helpers, Vitest, Playwright, Docker, Kubernetes, Kustomize, kubectl, and Prometheus-compatible metrics format.

**Storage**: In-memory active simulation run registry for MVP, with no durable history required. Completed run summaries may be retained in process memory for UI display until service restart. Future scale-out to 10,000+ players requires a shared coordination store or queue.

**Testing**: Vitest for simulator unit tests, contract tests for admin simulation endpoints and metrics output, integration tests against the existing realtime service, Playwright tests for admin UI workflows, load tests for 100 and 1,000 virtual players, Kubernetes manifest rendering checks, and HPA validation runs in a real cluster.

**Target Platform**: Admin UI in modern desktop browsers; simulator and realtime services in Linux containers on Kubernetes. AKS remains the primary deployment target, and manifests should remain cloud-neutral enough for EKS.

**Project Type**: Web application plus realtime backend plus independent load-generator service in an npm workspace monorepo.

**Performance Goals**: Start a 100-player simulation and show running status within 15 seconds; sustain 1,000 concurrent virtual players for 15 minutes in MVP; keep metric counts within 10% of observed run counts; close at least 95% of virtual player connections within 60 seconds after stop; emit virtual player inputs at configurable frequencies without unbounded event-loop or memory growth.

**Constraints**: Simulation disabled by default in production; simulation controls require administrator authorization; virtual players must use the same public HTTP and WebSocket paths as real users; simulator workload must scale independently; core gameplay correctness must not be bypassed; realtime backend active match ownership remains single-replica until shared session ownership is added.

**Scale/Scope**: MVP supports one active simulation run per environment, up to 1,000 concurrent virtual players and configurable match counts. Future expansion targets 10,000+ virtual players through distributed simulator coordination and distributed realtime session ownership.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: PASS - The plan keeps the simulator in a separate workspace service, shares contracts through `packages/contracts`, follows existing Fastify/Vite/Kubernetes patterns, and requires linting, formatting, type checks, manifest validation, and review before delivery.
- **Testing Standards**: PASS - Unit, contract, integration, Playwright, load, metrics, and Kubernetes HPA validation tests are identified. HPA validation requires a live cluster and is documented as release evidence rather than a local-only automated test.
- **User Experience Consistency**: PASS - Admin UI work reuses the existing web app shell and must include loading, running, stopping, error, disabled, invalid-config, and completed states with keyboard-accessible controls.
- **Performance Requirements**: PASS - The plan records measurable budgets for 100-player startup, 1,000-player sustained load, metric accuracy, shutdown cleanup, and event-loop/memory safety.

## Project Structure

### Documentation (this feature)

```text
specs/002-virtual-player-simulation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   └── simulation-metrics.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── admin/
│   │   └── realtime/
│   └── tests/
├── realtime/
│   ├── src/
│   └── tests/
└── simulator/
    ├── src/
    │   ├── config/
    │   ├── http/
    │   ├── metrics/
    │   ├── orchestration/
    │   ├── virtual-player/
    │   └── server.ts
    ├── tests/
    └── Dockerfile

packages/
├── contracts/
│   ├── src/
│   └── tests/
└── game-core/
    ├── src/
    └── tests/

infra/
└── k8s/
    ├── base/
    │   ├── simulator.yaml
    │   ├── simulator-hpa.yaml
    │   └── ingress.yaml
    └── overlays/
        ├── dev/
        ├── staging/
        └── prod/

scripts/
├── perf/
└── smoke/
```

**Structure Decision**: Add `apps/simulator` as a third workspace app because the load generator must be independently deployable and scalable. Add admin UI code under `apps/web/src/admin` because simulation control is a web UI workflow. Keep shared request/response shapes in `packages/contracts`; keep gameplay rules in `packages/game-core`; keep cloud deployment changes in existing `infra/k8s` overlays.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Third runtime service | The feature requires independently scalable load generation and external-client behavior | Embedding load generation in the realtime backend would mix test traffic with gameplay ownership and could affect correctness |

## Milestone Plan

1. **Contracts and simulator foundation**: Define admin simulation contracts, shared types, simulator config, health, auth guard, and run lifecycle skeleton.
2. **Virtual player engine**: Implement match allocation, session create/join flow, WebSocket client lifecycle, paddle behavior profiles, update frequency control, disconnect/reconnect behavior, and cleanup.
3. **Admin UI**: Add guarded simulation controls, validation feedback, status panels, run summaries, and disabled production state.
4. **Metrics integration**: Expose required Prometheus-compatible metrics and add dashboards/alert documentation.
5. **Kubernetes deployment**: Add simulator Dockerfile, Deployment, Service, ConfigMap/Secret refs, Ingress routing for admin API, probes, resources, and simulator HPA.
6. **HPA validation testing**: Add 100-player and 1,000-player runbooks/scripts, collect HPA evidence, verify metrics accuracy, and document operational limits.

## Task Breakdown by Milestone

### Milestone 1 - Contracts and Simulator Foundation

- Add simulation domain types to `packages/contracts`.
- Add admin simulation OpenAPI contract for create, get, list, stop, and metrics discovery.
- Scaffold `apps/simulator` with TypeScript config, package scripts, health endpoints, structured logging, and environment validation.
- Add administrator guard using a runtime-provided admin token for MVP, with production simulation disabled unless explicitly enabled.
- Add simulator run lifecycle state machine: requested, starting, running, stopping, completed, failed.
- Exit criteria: simulator service starts locally, health endpoint passes, contract tests cover request validation, and non-admin requests are rejected.

### Milestone 2 - Virtual Player Engine

- Implement simulation configuration validation for player count, match count, duration, behavior profile, update frequency, disconnect rate, and reconnect rate.
- Allocate virtual players into simulated matches with two virtual players per match by default.
- Create and join matches through the existing public session endpoints.
- Connect virtual players through the existing public WebSocket endpoint using returned player credentials.
- Implement behavior profiles such as balanced, aggressive, defensive, and erratic.
- Implement bounded input cadence, message sequencing, snapshot handling, paddle movement, scoring participation, disconnect/reconnect, and stop cleanup.
- Exit criteria: an integration test can run a small simulation against the realtime backend using the same paths as real players.

### Milestone 3 - Admin UI

- Add an admin simulation route/panel to the web app behind an explicit admin access gate.
- Build controls for all simulation configuration fields with validation and disabled states.
- Add start, stop, refresh, and status views.
- Show active virtual players, active simulated matches, elapsed time, remaining time, message activity, failures, and last error.
- Add UI states for disabled in production, unauthorized, service unavailable, invalid configuration, starting, running, stopping, completed, and failed.
- Exit criteria: Playwright verifies an administrator can start and stop a 100-player simulation from the UI, and non-admin access is denied.

### Milestone 4 - Metrics Integration

- Add simulator metrics registry with the required metric names.
- Emit active virtual players, active simulated matches, WebSocket connections, messages per second, simulation runs total, and simulation failures total.
- Add labels only where they are low-cardinality and useful for operations.
- Expose metrics in Prometheus-compatible text format.
- Add metrics contract tests and operational dashboard documentation.
- Exit criteria: metrics reflect a running simulation within the accuracy budget and remain available during failures.

### Milestone 5 - Kubernetes Deployment

- Add simulator Dockerfile using non-root runtime execution.
- Add Kubernetes Deployment and Service for `pingpong-simulator`.
- Add ConfigMap values for target base URL, WebSocket URL, max players, default behavior, production enablement, and metrics settings.
- Add Secret reference for the admin token.
- Add Ingress route for simulator admin API under `/admin/simulations` while keeping `/`, `/api`, and `/ws` routing intact.
- Add simulator HPA with conservative min/max replicas and resource requests/limits.
- Update AKS/EKS README and quickstart commands for simulator image build, deployment, and verification.
- Exit criteria: simulator deploys as a separate pod set and can be scaled independently from web and realtime.

### Milestone 6 - HPA Validation Testing

- Add scripted 100-player smoke simulation.
- Add scripted 1,000-player cluster validation run.
- Capture HPA scaling events, pod counts, metrics snapshots, and simulation run summaries.
- Verify real gameplay control sessions during simulation load.
- Document expected behavior when realtime backend capacity is exhausted.
- Exit criteria: release evidence shows 100-player UI flow, 1,000-player sustained run, metric accuracy, cleanup behavior, and HPA response.

## Key Dependencies

- Existing realtime session create/join and WebSocket protocol.
- Existing frontend routing and UI shell.
- Existing `packages/contracts` and `packages/game-core`.
- Kubernetes ingress that can route `/admin/simulations`, `/api`, `/ws`, and `/`.
- A non-production cluster for 1,000-player and HPA validation.
- Administrator token or future identity provider integration.
- Prometheus-compatible metrics scraper or manual metrics collection during validation.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Simulation overload affects real gameplay | High | Disable by default in production, require admin authorization, cap MVP players, isolate simulator workload, and validate real gameplay during load tests |
| Virtual players accidentally bypass real paths | High | Contract and integration tests must prove virtual players use session create/join and WebSocket endpoints returned by the app |
| Realtime backend cannot scale beyond one active match owner | High | Keep backend active-session HPA capped for MVP, size the single owner for 1,000-player validation, and document distributed session ownership as required for 10,000+ |
| Metrics become misleading under failure | Medium | Track active counts from connection lifecycle, expose failure counters, and compare metrics to run summaries in validation |
| Admin controls become reachable in production | High | Production disabled by default, require explicit enablement and admin token, and test denied access paths |
| Simulator workers leak connections after stop | Medium | Implement cancellation, deadline-based cleanup, connection tracking, and stop verification tests |
| HPA validation is flaky due to cluster conditions | Medium | Define repeatable runbook, collect event evidence, and separate simulator HPA validation from realtime backend scaling limits |

## Post-Design Constitution Check

- **Code Quality**: PASS - Design keeps interfaces typed and contract-driven, isolates simulator code, and documents the only additional service complexity.
- **Testing Standards**: PASS - Design artifacts define unit, contract, integration, UI, metrics, load, smoke, and HPA validation coverage.
- **User Experience Consistency**: PASS - Admin UI states and accessibility requirements are part of the milestone scope.
- **Performance Requirements**: PASS - MVP performance budgets are measurable and mapped to validation evidence.
