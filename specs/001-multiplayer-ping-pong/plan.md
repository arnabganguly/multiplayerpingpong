# Implementation Plan: Browser Ping Pong on AKS

**Branch**: `001-multiplayer-ping-pong` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-multiplayer-ping-pong/spec.md`

**Plan Status**: Ready for Phase 2 task generation

## Executive Summary

Deliver a responsive browser Ping Pong game with a fast local game loop, single-player AI, local two-player controls, invite-only online two-player sessions, and a production-shaped Azure Kubernetes Service deployment. The fastest stable path is to build shared deterministic game rules first, then layer UI, AI, local multiplayer, online synchronization, and AKS deployment in that order.

The implementation will use a TypeScript monorepo so the browser and backend share the same game rules and event contracts. The frontend will render the court with Canvas 2D inside a React/Vite application. The backend will provide HTTP session endpoints and WebSocket realtime play using an authoritative server-owned online match state. Version 1 will not require user accounts, persistence, public matchmaking, chat, leaderboards, or match history.

## MVP Scope

**In scope for first release**:

- Single-player match versus AI with score, win condition, pause/resume, restart, keyboard controls, and touch controls.
- Local two-player match on one device with separate desktop and touch controls.
- Invite-only online two-player match with create/join flow, player tokens, authoritative state, reconnect grace period, and match completion.
- Shared game rules for scoring, collision, serve, difficulty progression, and match state transitions.
- Responsive HUD for score, serve state, pause/reconnect state, and winner.
- Container images for frontend and backend.
- AKS deployment manifests using Kubernetes Deployment, Service, Ingress, ConfigMap, Secret, probes, resource requests/limits, and autoscaling where safe.
- CI/CD pipeline from local development through dev, staging, and production-style deployment.
- Logging, metrics, health checks, and basic dashboards/alerts.

**Deferred from first release**:

- User accounts, profile pages, public matchmaking, friend lists, chat, spectators, tournaments, achievements, analytics-heavy personalization, match history, leaderboards, paid features, and cross-region play.
- Multi-backend active match ownership. The backend can scale stateless HTTP and health paths later, but version 1 keeps active online sessions owned by one backend replica for stability unless Redis/Web PubSub support is added.
- Advanced physics such as spin, custom paddles, power-ups, replay capture, and server-side anti-cheat beyond input validation and authoritative scoring.

## Architecture Overview

### Services

- **Frontend web app**: React + TypeScript application built with Vite. React manages menus, HUD, controls, and status states. Canvas 2D renders the court, ball, paddles, and gameplay effects.
- **Realtime backend**: Node.js LTS + TypeScript service using Fastify for HTTP endpoints and WebSocket support for realtime sessions. It owns online match state, validates input, manages sessions, exposes health/metrics, and emits structured logs.
- **Shared game core**: TypeScript package used by both frontend and backend for deterministic scoring, collision, paddle bounds, win conditions, serve logic, match state transitions, and AI behavior.
- **Contracts package**: Shared TypeScript types and validation schemas generated or maintained from the HTTP and realtime contracts.
- **Infrastructure manifests**: Kubernetes base and environment overlays for local/dev/staging/prod-style deployment.

### Realtime Synchronization

- Local single-player and local two-player modes run fully in the browser using the shared game core.
- Online mode uses the backend as the authoritative owner for ball position, paddle bounds, scoring, pause/resume, restart, reconnect, and match end.
- The backend runs a fixed online simulation tick at 30 Hz by default and sends `state.snapshot` at join/reconnect and `state.delta` updates during play.
- The frontend renders at the browser animation rate, applies local paddle prediction for immediate feel, and reconciles to backend state on each authoritative update.
- Client input events include protocol version, session id, player token, player id, sequence number, timestamp, and input payload. The backend rejects stale, malformed, unauthorized, out-of-bounds, or rate-excessive events.
- Reconnect uses the original session id and player token. If the player returns within 30 seconds, the backend sends a fresh snapshot and resumes the match.

### Multiplayer Session Handling

- Session creation returns a private join code/link and a player token for Player 1.
- Session join validates the code, capacity, expiry, and player token assignment, then returns Player 2 details.
- Online sessions are stored in backend memory for v1 to minimize moving parts and keep the release stable.
- Production v1 should run the backend online-session owner as one replica sized for the 100 concurrent match target. Frontend replicas and static serving paths can scale horizontally immediately.
- If launch traffic requires multiple backend session owners, add Azure Cache for Redis or Azure Web PubSub in a follow-up milestone before raising backend `maxReplicas` above 1 for active online play.

### Azure Architecture

- Azure Kubernetes Service hosts frontend and backend workloads.
- Azure Container Registry stores versioned frontend and backend images.
- A public Kubernetes Ingress exposes `/`, `/api`, and `/ws` over HTTPS. The cost-conscious default is NGINX Ingress on AKS; Application Gateway Ingress Controller is a production hardening option when WAF or managed L7 features are required.
- Azure Key Vault plus the Secrets Store CSI Driver supplies production secrets.
- Azure Monitor, Container Insights, and managed Prometheus-compatible metrics provide logs, metrics, alerts, and dashboards.
- Optional Azure Cache for Redis is reserved for distributed online session routing, reconnect handoff, or leaderboard/session metadata needs beyond v1.

## Technical Context

**Language/Version**: TypeScript across frontend, backend, shared game core, and contracts. Use current Node.js LTS at implementation time.

**Primary Dependencies**: React, Vite, Canvas 2D browser APIs, Fastify, `@fastify/websocket` or `ws`, Zod or equivalent runtime validation, Vitest, Playwright, Docker, Kubernetes, Kustomize, Azure CLI, kubectl.

**Storage**: None for v1 gameplay. In-memory backend session state for online matches. Optional Redis/PostgreSQL/Cosmos DB deferred unless active-session scaling, profiles, match history, or leaderboards are added.

**Testing**: Vitest for shared game core and backend unit tests, contract/schema tests for HTTP and realtime events, Playwright for browser flows, accessibility checks with automated tooling, load tests for WebSocket sessions, and manifest validation for Kubernetes.

**Target Platform**: Modern desktop and mobile browsers for gameplay; Linux containers on Azure Kubernetes Service for deployed services.

**Project Type**: Web application with a frontend app, realtime backend service, shared packages, and Kubernetes infrastructure.

**Performance Goals**: 55+ fps desktop for 95% of normal 5-minute gameplay, 30+ fps mobile, local input visible within 50 ms p95, online opponent movement visible within 150 ms p95 in-region, 100 concurrent online matches in baseline deployment.

**Constraints**: No account dependency in v1, no persistence in MVP, HTTPS/WSS in deployed environments, 30-second reconnect grace period, backend authoritative online scoring, frontend and backend delivered as separate containers, cost-conscious AKS baseline.

**Scale/Scope**: First release targets anonymous invite-only play, one primary Azure region, 100 concurrent online matches, and a small team implementation path.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: PASS - TypeScript, shared packages, runtime schemas, linting, formatting, type checks, Docker builds, manifest validation, and code review are required before delivery.
- **Testing Standards**: PASS - Unit, integration, contract, end-to-end, accessibility, performance, load, security, and deployment smoke checks are planned by milestone.
- **User Experience Consistency**: PASS - The plan includes responsive layout, keyboard/touch controls, HUD states, error states, reconnect states, accessibility checks, and no marketing page before gameplay.
- **Performance Requirements**: PASS - Frame rate, input latency, online latency, load, startup, and rollout budgets are documented and have planned measurement.

## Project Structure

### Documentation (this feature)

```text
specs/001-multiplayer-ping-pong/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   └── realtime-events.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── game/
│   │   ├── hud/
│   │   ├── controls/
│   │   └── realtime/
│   ├── tests/
│   └── Dockerfile
└── realtime/
    ├── src/
    │   ├── http/
    │   ├── websocket/
    │   ├── sessions/
    │   ├── observability/
    │   └── config/
    ├── tests/
    └── Dockerfile

packages/
├── game-core/
│   ├── src/
│   └── tests/
└── contracts/
    ├── src/
    └── tests/

infra/
└── k8s/
    ├── base/
    └── overlays/
        ├── dev/
        ├── staging/
        └── prod/

.github/
└── workflows/
    ├── ci.yml
    └── deploy.yml
```

**Structure Decision**: Use a small TypeScript monorepo with two apps, two shared packages, and Kubernetes manifests under `infra/k8s`. This keeps game rules shared without introducing a separate service for core logic.

## Complexity Tracking

No constitution violations are planned. The only notable tradeoff is keeping online session state in memory for v1, which reduces operational complexity but intentionally limits backend active-session horizontal scaling until a shared session routing layer is introduced.

## Milestone Plan

1. **Foundation and shared contracts**: Establish repo structure, TypeScript workspace, shared game-core package, contracts package, quality tooling, and CI skeleton.
2. **Core local game loop**: Build deterministic court, paddles, ball, scoring, collision, serve, win condition, pause/resume, restart, and keyboard controls.
3. **AI, local two-player, and responsive UX**: Add AI behavior, difficulty progression, touch controls, local two-player controls, HUD polish, accessibility, and mobile layout validation.
4. **Online multiplayer service**: Add session create/join, WebSocket protocol, authoritative online simulation, validation, reconnect, graceful leave, and two-client synchronization tests.
5. **Containers, CI/CD, and AKS deployment**: Build images, add manifests, configure ingress, secrets/config, health checks, autoscaling boundaries, deployment pipeline, and environment promotion.
6. **Hardening and release**: Run performance/load/security/deployment tests, tune latency, verify observability, document operations, complete release criteria, and cut the first shippable version.

## Task Breakdown by Milestone

### Milestone 1 - Foundation and Shared Contracts

- Create workspace structure under `apps/`, `packages/`, and `infra/`.
- Configure TypeScript, linting, formatting, unit test runner, Playwright, and shared scripts.
- Define shared domain types for player, session, game state, input event, and match result.
- Implement runtime validation schemas for HTTP requests and realtime messages.
- Add CI workflow for install, lint, type check, unit tests, and contract validation.
- Exit criteria: empty app shells build, shared packages test, CI passes, and contract files match shared types.

### Milestone 2 - Core Local Game Loop

- Implement game-core rules for paddle movement, ball movement, collisions, scoring, serve, win by 2, pause/resume, restart, and match end.
- Render the court, paddles, ball, center line, score, and game status in the browser.
- Add desktop keyboard controls and stable frame timing using `requestAnimationFrame`.
- Add unit tests for all game-core rules and edge collisions.
- Add Playwright smoke test for starting and completing a local single-player stub match.
- Exit criteria: a developer can play a local match loop with deterministic scoring and no backend.

### Milestone 3 - AI, Local Two-Player, and Responsive UX

- Implement AI paddle target selection, bounded reaction speed, miss chance, and difficulty ramp.
- Add mode selection for single-player, local two-player, and online placeholder.
- Add local two-player keyboard mappings and touch controls for both sides.
- Build HUD states for serving, in play, paused, point scored, match ended, waiting, reconnecting, and errors.
- Validate responsive layouts on desktop, tablet, and mobile viewport sizes.
- Add accessibility checks for menus, buttons, status text, focus order, contrast, and reduced motion.
- Exit criteria: single-player and local two-player are shippable-quality on supported desktop and mobile viewports.

### Milestone 4 - Online Multiplayer Service

- Implement backend config loading, health endpoints, metrics endpoint, structured logging, and error handling.
- Implement `POST /sessions`, `POST /sessions/{sessionId}/join`, and limited `GET /sessions/{sessionId}`.
- Implement WebSocket `session.join`, `input.paddle`, `match.pause`, `match.resume`, `match.restart`, `session.leave`, and heartbeat handling.
- Run authoritative online match simulation with fixed tick, snapshots, deltas, point scoring, and match end.
- Add player tokens, allowed origins, rate limits, sequence validation, and input bounds validation.
- Add reconnect within 30 seconds and expired session cleanup.
- Add backend integration tests and two-client Playwright tests with simulated disconnects.
- Exit criteria: two browsers can complete an online match through the backend with synchronized state and reconnect behavior.

### Milestone 5 - Containers, CI/CD, and AKS Deployment

- Add production Dockerfiles for frontend and backend using non-root runtime users.
- Add Kubernetes base manifests for Namespace, Deployments, Services, Ingress, ConfigMap, Secret references, probes, resources, and HPAs.
- Add overlays for dev, staging, and prod-style environments.
- Add CI steps to build, test, scan, tag, and push images to Azure Container Registry.
- Add deployment workflow using kubectl/Kustomize against AKS with manual production approval.
- Configure HTTPS ingress, `/api` and `/ws` routing, frontend cache headers, and WebSocket upgrade support.
- Configure Key Vault CSI or Kubernetes Secret fallback for `SESSION_TOKEN_SIGNING_SECRET`.
- Exit criteria: dev/staging AKS deployment serves playable local and online matches through the public ingress.

### Milestone 6 - Hardening and Release

- Run frame-rate, input latency, online latency, load, and reconnect tests against a production-like cluster.
- Tune tick rate, payload size, snapshot cadence, resource requests/limits, and ingress timeouts.
- Validate rolling update drain and active match behavior.
- Validate logs, metrics, dashboards, and alerts.
- Run security checks for secret handling, token leakage, origin restrictions, container permissions, and malformed input rejection.
- Complete runbooks for deploy, rollback, incident triage, and cost controls.
- Exit criteria: all definition-of-done items pass and release approval is recorded.

## Key Dependencies

- Node.js LTS and npm workspace support.
- Browser Canvas 2D and WebSocket support in current stable desktop and mobile browsers.
- Azure subscription, AKS cluster, Azure Container Registry, and permissions to configure ingress, Key Vault, and monitoring.
- CI/CD environment with access to ACR and AKS through federated identity or secure credentials.
- Product decision to keep v1 anonymous and invite-only.
- Operational decision on ingress controller: NGINX for cost-conscious MVP, Application Gateway if WAF or managed L7 features are required.
- Launch sizing decision for Azure region, node SKU, and target concurrent online matches.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Online latency makes gameplay feel unfair | High | Server-authoritative state, local paddle prediction, compact deltas, fixed tick rate, in-region deployment, latency tests before release |
| Collision edge cases cause inconsistent scoring | High | Shared deterministic game-core tests, high-speed collision tests, duplicate point prevention, replayable deterministic input sequences |
| Mobile controls obscure gameplay | Medium | Design mobile-first control zones, viewport tests, touch target checks, orientation handling, user testing before release |
| Backend in-memory sessions limit horizontal scaling | Medium | Keep v1 backend session owner to one replica, load test 100 matches, document capacity, add Redis/Web PubSub before increasing backend active-session replicas |
| WebSocket ingress timeouts or upgrade issues | Medium | Test `/ws` through the chosen ingress, configure idle timeouts, heartbeat events, and deployment smoke checks |
| AKS cost grows before product validation | Medium | Use small node pool, autoscale frontend only at first, omit databases, use Basic/low-tier managed services where acceptable, set resource requests/limits |
| Secrets leak into images or frontend config | High | Key Vault CSI, no secret build args, secret scanning, runtime env validation, token redaction in logs |
| CI/CD deploys incompatible contracts | Medium | Contract tests, shared types, protocol version checks, staging promotion gate, smoke tests before production |
| Rolling update drops active online matches | Medium | Readiness drain, termination grace period, reconnect grace, rollout test, conservative backend deployment cadence |

## Test Plan

- **Unit tests**: Game-core rules, AI decisions, collision, scoring, state transitions, config validation, token validation, and rate-limit logic.
- **Contract tests**: HTTP request/response schemas, realtime event schemas, protocol version compatibility, invalid payload rejection.
- **Integration tests**: Session create/join, WebSocket handshake, authoritative tick, snapshots/deltas, disconnect/reconnect, restart, leave, expired session cleanup.
- **End-to-end tests**: Single-player, local two-player, online two-browser match, pause/resume, restart, match end, mobile viewport, keyboard navigation.
- **Accessibility tests**: Automated checks plus focused manual verification for focus order, contrast, labels, keyboard operation, status announcements, and reduced motion.
- **Performance tests**: Browser frame rate, startup time, local input latency, online visible movement latency, payload size, backend tick health, and CPU/memory usage.
- **Load tests**: 100 concurrent online matches, session creation bursts, reconnect bursts, long-running WebSocket connections, and rollout under active sessions.
- **Security tests**: Malformed event fuzzing, unauthorized token attempts, cross-origin rejection, rate-limit enforcement, secret scanning, image scanning, and dependency audit.
- **Deployment tests**: Docker build, container startup, probes, ingress HTTPS/WSS routing, config/secret presence, HPA behavior, rollback, and smoke tests after deployment.

## Deployment Plan

### Local Development to Cluster Workflow

1. Run shared game-core, frontend, and backend locally with `npm` workspace scripts.
2. Use Playwright for local browser flows and two-client online simulations against the local backend.
3. Build frontend and backend container images locally.
4. Run local containers with environment variables that mirror AKS config.
5. Push images to Azure Container Registry from CI.
6. Deploy to AKS dev overlay with generated image tags.
7. Promote the same image tags to staging after automated smoke tests pass.
8. Promote to production-style overlay after manual approval, load-test evidence, and release checklist sign-off.

### AKS Deployment Approach

- Use Kustomize overlays for `dev`, `staging`, and `prod` to avoid Helm complexity until templating needs justify it.
- Deploy frontend and backend as separate Deployments and Services.
- Route `/` to frontend, `/api` to backend HTTP, and `/ws` to backend WebSocket through a single HTTPS Ingress.
- Use ConfigMaps for non-secret runtime configuration and Key Vault CSI or Kubernetes Secrets for sensitive values.
- Set frontend HPA based on CPU/request metrics. Keep backend active-session owner at one replica for v1 unless Redis/Web PubSub is added and tested.
- Configure backend readiness to fail during drain so new sessions stop before pod termination.
- Use rolling updates with conservative max unavailable values and a termination grace period longer than the reconnect/drain path.

### Observability and Operations

- Emit JSON logs with request id, session id, player side, event type, outcome, and error code. Never log player tokens.
- Expose `/health/live`, `/health/ready`, and `/metrics`.
- Track active sessions, connected players, backend tick duration, state update latency, rejected inputs, disconnects, reconnects, match completion, HTTP errors, WebSocket close codes, CPU, memory, and pod restarts.
- Send container logs and metrics to Azure Monitor/Log Analytics with dashboard panels for gameplay health and deployment health.
- Add alerts for high error rate, repeated readiness failures, high disconnect rate, backend tick lag, resource saturation, and session capacity exhaustion.

## Definition of Done

- All MVP user stories in the specification pass their acceptance scenarios.
- Single-player, local two-player, and online two-player matches are playable from the first screen.
- Required keyboard and touch controls work on supported desktop and mobile browsers.
- Shared game-core tests cover scoring, collisions, win condition, pause/resume, restart, AI, and difficulty progression.
- HTTP and realtime contract tests pass and reject invalid payloads.
- End-to-end tests cover single-player, local two-player, online two-client, reconnect, and deployment smoke flows.
- Performance budgets are measured and meet the documented thresholds.
- Frontend and backend images build reproducibly and run as non-root users.
- AKS manifests include Deployment, Service, Ingress, ConfigMap, Secret references, probes, resources, and autoscaling where safe.
- Logs, metrics, dashboards, and alerts are verified in a production-like AKS environment.
- CI/CD can build, test, push images, deploy to dev/staging, and promote with approval.
- Release notes, quickstart, rollback steps, and operational runbook are complete.

## Assumptions and Open Questions

### Assumptions

- Version 1 remains anonymous and invite-only.
- One Azure region is enough for launch.
- Backend single-replica active-session ownership can meet the 100 concurrent online match target.
- The team can use TypeScript across frontend and backend.
- GitHub Actions is acceptable for CI/CD unless the repository uses another CI provider.
- NGINX Ingress is acceptable for the cost-conscious MVP unless WAF is required.
- Persistence is not needed until profiles, history, or leaderboards are explicitly added.

### Open Questions

- Which Azure region should be used for the first production-like environment?
- Should the production ingress use NGINX for cost or Application Gateway for WAF/managed L7 features?
- What browser/device matrix should be treated as release-blocking?
- Is 100 concurrent online matches still the first launch target, or should load testing target a higher launch event number?
- Should audio, visual theme, or brand identity be included before first release, or after gameplay stability?

## Phase 0 Research Summary

Research decisions are captured in [research.md](./research.md). All planning unknowns were resolved with concrete defaults and no unresolved clarification markers.

## Phase 1 Design Artifacts

- [data-model.md](./data-model.md)
- [contracts/openapi.yaml](./contracts/openapi.yaml)
- [contracts/realtime-events.md](./contracts/realtime-events.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Code Quality**: PASS - The design uses shared packages, typed contracts, validation schemas, CI checks, and reviewable milestone increments.
- **Testing Standards**: PASS - Each executable behavior has planned automated coverage, with manual checks limited to usability and release acceptance evidence.
- **User Experience Consistency**: PASS - UX states, accessibility, responsive controls, and gameplay-first navigation are built into the milestone plan.
- **Performance Requirements**: PASS - The plan includes measurable budgets, instrumentation, load tests, and release blockers for latency/frame-rate misses.
