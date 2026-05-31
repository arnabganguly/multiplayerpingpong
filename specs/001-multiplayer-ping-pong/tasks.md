# Tasks: Browser Ping Pong on AKS

**Input**: Design documents from `specs/001-multiplayer-ping-pong/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml), [contracts/realtime-events.md](./contracts/realtime-events.md), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are required for executable behavior changes by the project constitution. Write the test task first, verify it fails for missing behavior, then implement.

**Organization**: Tasks are grouped by dependency phase and user story so each story remains independently testable. Metadata tables after each checklist provide owner, dependencies, size, acceptance criteria, priority, and suggested order.

**Effort Sizes**: S = <= 1 day, M = 1-3 days, L = 3-5 days, XL = split before implementation.

**Priority**: P0 = release blocker, P1 = MVP release, P2 = post-MVP or hardening, P3 = deferred/nice-to-have.

**Requested Section Mapping**:

1. Project setup and foundations: Phases 1-2
2. Game client implementation: Phases 3, 4, and 6
3. Game server and real time sync: Phase 5
4. Multiplayer and session handling: Phase 5
5. Testing and quality assurance: Story test blocks plus Phase 10
6. Containerization and Kubernetes setup: Phase 7
7. Azure deployment and infrastructure: Phase 8
8. Observability and operations: Phase 9
9. Release preparation: Phase 11
10. Deferred tasks: Phase 12

## Phase 1: Project Setup and Foundations

**Purpose**: Create the TypeScript monorepo, app shells, quality tooling, CI skeleton, and documentation references that every later task depends on.

**Blockers and Risks**: Blocks all executable feature work. Risk is tooling churn; keep choices aligned to `plan.md` and avoid adding frameworks outside the approved stack.

### Tasks

- [X] T001 Create npm workspace root configuration in `package.json`
- [X] T002 Create monorepo directory skeleton with placeholder files in `apps/web/src/app/.gitkeep`, `apps/realtime/src/http/.gitkeep`, `packages/game-core/src/.gitkeep`, `packages/contracts/src/.gitkeep`, and `infra/k8s/base/.gitkeep`
- [X] T003 [P] Configure shared TypeScript settings in `tsconfig.base.json`
- [X] T004 [P] Configure linting and formatting in `eslint.config.js` and `.prettierrc`
- [X] T005 [P] Configure Vitest workspace test settings in `vitest.config.ts`
- [X] T006 [P] Configure Playwright browser test settings in `playwright.config.ts`
- [X] T007 Create React/Vite web app package scaffold in `apps/web/package.json` and `apps/web/vite.config.ts`
- [X] T008 Create Fastify realtime service package scaffold in `apps/realtime/package.json` and `apps/realtime/src/server.ts`
- [X] T009 Create shared package manifests in `packages/game-core/package.json` and `packages/contracts/package.json`
- [X] T010 Configure shared root scripts for dev, build, lint, typecheck, test, e2e, and smoke in `package.json`
- [X] T011 Create CI pull request workflow for install, lint, typecheck, unit tests, and builds in `.github/workflows/ci.yml`
- [X] T012 Document local developer commands and environment variables in `README.md`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T001 | Full-stack engineer | None | S | `package.json` defines npm workspaces for apps and packages | P0 | 1 |
| T002 | Full-stack engineer | T001 | S | Planned directories exist and match `plan.md` structure | P0 | 2 |
| T003 | Full-stack engineer | T001 | S | Shared TypeScript config supports app/package builds | P0 | 3 |
| T004 | Full-stack engineer | T001 | S | Lint and format commands can run from root | P0 | 3 |
| T005 | QA engineer | T001 | S | Unit test command can discover workspace tests | P0 | 3 |
| T006 | QA engineer | T001 | S | Playwright command can launch web tests | P0 | 3 |
| T007 | Frontend engineer | T001-T004 | M | Vite app starts and builds with placeholder UI | P0 | 4 |
| T008 | Backend engineer | T001-T004 | M | Realtime service starts with placeholder health response | P0 | 4 |
| T009 | Full-stack engineer | T001-T004 | S | Shared packages build with placeholder exports | P0 | 4 |
| T010 | Full-stack engineer | T007-T009 | S | Root scripts run each workspace command consistently | P0 | 5 |
| T011 | DevOps engineer | T010 | M | Pull request workflow runs root quality checks | P0 | 6 |
| T012 | Technical writer | T010 | S | README matches quickstart local command expectations | P1 | 6 |

**Checkpoint**: Project setup is complete when root install, build, lint, typecheck, unit test, and app startup commands all work.

---

## Phase 2: Foundational Shared Game and Contract Prerequisites

**Purpose**: Implement the shared runtime models, contract schemas, configuration, and base app/service wiring that all user stories depend on.

**Blockers and Risks**: Blocks all user story phases. The main risk is contract drift between frontend and backend; keep schemas in `packages/contracts` and consume them from both apps.

### Tasks

- [X] T013 [P] Define shared domain types for Player, GameSession, GameState, InputEvent, PlayerToken, and MatchResult in `packages/contracts/src/domain.ts`
- [X] T014 [P] Define HTTP request and response schemas from OpenAPI contract in `packages/contracts/src/http.ts`
- [X] T015 [P] Define realtime event schemas from realtime contract in `packages/contracts/src/realtime.ts`
- [X] T016 [P] Add contract schema unit tests in `packages/contracts/tests/contracts.test.ts`
- [X] T017 Implement game constants and coordinate model in `packages/game-core/src/constants.ts`
- [X] T018 Implement match state machine transitions in `packages/game-core/src/state-machine.ts`
- [X] T019 Implement shared scoring and win-condition rules in `packages/game-core/src/scoring.ts`
- [X] T020 Implement shared paddle and ball primitive types in `packages/game-core/src/entities.ts`
- [X] T021 Add game-core unit test harness and fixtures in `packages/game-core/tests/fixtures.ts`
- [X] T022 [P] Implement backend environment config validation in `apps/realtime/src/config/env.ts`
- [X] T023 [P] Implement frontend environment config access in `apps/web/src/app/config.ts`
- [X] T024 Implement backend structured logger bootstrap in `apps/realtime/src/observability/logger.ts`
- [X] T025 Implement backend base health routes in `apps/realtime/src/http/health-routes.ts`
- [X] T026 Implement frontend app shell and route state container in `apps/web/src/app/App.tsx`
- [X] T027 Create shared design tokens and layout baseline in `apps/web/src/app/styles.css`
- [X] T028 Wire packages into web and realtime app imports in `apps/web/src/app/App.tsx` and `apps/realtime/src/server.ts`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T013 | Full-stack engineer | T009 | M | Domain types compile and match `data-model.md` entities | P0 | 7 |
| T014 | Backend engineer | T013 | M | HTTP schemas cover health and session contracts | P0 | 8 |
| T015 | Full-stack engineer | T013 | M | Realtime schemas cover all client/server events | P0 | 8 |
| T016 | QA engineer | T014-T015 | M | Invalid and valid contract payload tests pass | P0 | 9 |
| T017 | Gameplay engineer | T013 | S | Court units, paddle limits, score defaults, tick defaults are exported | P0 | 9 |
| T018 | Gameplay engineer | T017 | M | Legal and illegal state transitions are deterministic | P0 | 10 |
| T019 | Gameplay engineer | T017 | M | First-to-11 win-by-2 logic is configurable and tested later | P0 | 10 |
| T020 | Gameplay engineer | T017 | S | Ball and paddle types are shared by renderer and backend | P0 | 10 |
| T021 | QA engineer | T017-T020 | S | Test fixtures create valid baseline game states | P0 | 11 |
| T022 | Backend engineer | T008 | M | Missing required backend env fails closed at startup | P0 | 11 |
| T023 | Frontend engineer | T007 | S | Web app reads public runtime config without secrets | P0 | 11 |
| T024 | Backend engineer | T022 | S | Backend logs structured JSON with redaction helper | P0 | 12 |
| T025 | Backend engineer | T022-T024 | S | `/health/live` and `/health/ready` return correct states locally | P0 | 12 |
| T026 | Frontend engineer | T007-T023 | M | Web app shows initial mode selection shell | P0 | 12 |
| T027 | Frontend engineer | T026 | S | Base CSS supports responsive full-screen app layout | P1 | 13 |
| T028 | Full-stack engineer | T013-T027 | S | Web and backend compile while importing shared packages | P0 | 14 |

**Checkpoint**: Foundation is complete when shared types, validation, env config, health routes, app shell, and package imports compile and test cleanly.

---

## Phase 3: Game Client Implementation - User Story 1 Play Against AI (Priority: P1)

**Goal**: A player can start and complete a single-player match against AI with score, win condition, pause/resume, restart, keyboard controls, touch controls, and a clear HUD.

**Independent Test**: Start single-player mode from the first screen, score points for both sides, pause/resume, restart, and finish a match without using the backend.

**Blockers and Risks**: Depends on Phase 2. Collision and timing bugs are the biggest gameplay risk; tests must cover edge contacts and duplicate scoring.

### Tests for User Story 1

- [X] T029 [P] [US1] Add scoring and win-condition unit tests in `packages/game-core/tests/scoring.test.ts`
- [X] T030 [P] [US1] Add collision and paddle-boundary unit tests in `packages/game-core/tests/collision.test.ts`
- [X] T031 [P] [US1] Add state transition unit tests for serve, pause, resume, restart, and match end in `packages/game-core/tests/state-machine.test.ts`
- [X] T032 [P] [US1] Add AI behavior unit tests in `packages/game-core/tests/ai.test.ts`
- [X] T033 [P] [US1] Add single-player browser flow test in `apps/web/tests/single-player.spec.ts`

### Implementation for User Story 1

- [X] T034 [US1] Implement ball movement and wall collision rules in `packages/game-core/src/physics.ts`
- [X] T035 [US1] Implement paddle collision and scoring-boundary detection in `packages/game-core/src/collision.ts`
- [X] T036 [US1] Implement rally speed progression and speed cap rules in `packages/game-core/src/difficulty.ts`
- [X] T037 [US1] Implement AI target selection and bounded reaction behavior in `packages/game-core/src/ai.ts`
- [X] T038 [US1] Implement local match engine orchestration in `packages/game-core/src/local-match.ts`
- [X] T039 [P] [US1] Implement Canvas 2D court renderer in `apps/web/src/game/CourtCanvas.tsx`
- [X] T040 [P] [US1] Implement keyboard input hook for player paddle control in `apps/web/src/controls/useKeyboardControls.ts`
- [X] T041 [P] [US1] Implement touch input hook for single-player control in `apps/web/src/controls/useTouchControls.ts`
- [X] T042 [US1] Implement HUD score, serve, pause, restart, and winner display in `apps/web/src/hud/GameHud.tsx`
- [X] T043 [US1] Implement single-player mode screen and game loop in `apps/web/src/game/SinglePlayerGame.tsx`
- [X] T044 [US1] Connect mode selection to single-player flow in `apps/web/src/app/App.tsx`
- [X] T045 [US1] Verify and tune single-player frame budget instrumentation in `apps/web/src/game/useFrameMetrics.ts`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T029 | QA engineer | T019-T021 | S | Scoring tests fail before implementation and pass after T034-T038 | P0 | 15 |
| T030 | QA engineer | T020-T021 | M | Collision tests cover wall, paddle face, paddle edge, and score boundary | P0 | 15 |
| T031 | QA engineer | T018-T021 | S | State transition tests cover serve, pause, resume, restart, end | P0 | 15 |
| T032 | QA engineer | T021 | S | AI tests prove bounded reaction and miss behavior | P1 | 15 |
| T033 | QA engineer | T026 | M | Browser test proves independent single-player journey | P1 | 15 |
| T034 | Gameplay engineer | T030 | M | Ball updates deterministically by elapsed time and court bounds | P0 | 16 |
| T035 | Gameplay engineer | T030-T034 | M | Paddle contacts and point scoring are fair and duplicate-safe | P0 | 17 |
| T036 | Gameplay engineer | T034-T035 | S | Rally speed increases within configured cap | P1 | 18 |
| T037 | Gameplay engineer | T032-T034 | M | AI follows ball with bounded reaction and beatable imperfection | P1 | 18 |
| T038 | Gameplay engineer | T029-T037 | M | Local engine advances full match states without renderer dependency | P0 | 19 |
| T039 | Frontend engineer | T027 | M | Canvas renders stable court, ball, paddles, and center line | P0 | 19 |
| T040 | Frontend engineer | T026 | S | Keyboard controls update player intent within local input budget | P0 | 19 |
| T041 | Frontend engineer | T026 | S | Touch controls update player intent without blocking the court | P1 | 19 |
| T042 | Frontend engineer | T026-T027 | M | HUD shows score, serve, pause, restart, and winner states | P0 | 20 |
| T043 | Frontend engineer | T038-T042 | M | Single-player mode is playable end-to-end in browser | P0 | 21 |
| T044 | Frontend engineer | T043 | S | Mode selection starts and exits single-player mode | P0 | 22 |
| T045 | Frontend engineer | T043 | S | Frame metrics capture desktop/mobile budget signals | P1 | 23 |

**Checkpoint**: User Story 1 is complete when the single-player flow passes game-core unit tests and the Playwright single-player test.

---

## Phase 4: Game Client Implementation - User Story 3 Local Two-Player Match (Priority: P2)

**Goal**: Two players can complete a local match on one desktop or mobile device using separate controls.

**Independent Test**: Choose local two-player mode, move both paddles independently, score points, pause/resume, restart, and finish the match on one device.

**Blockers and Risks**: Depends on US1 game loop. Risk is input conflict and cramped touch controls; validate simultaneous input and viewport behavior early.

### Tests for User Story 3

- [X] T046 [P] [US3] Add local two-player input unit tests in `apps/web/tests/local-controls.test.ts`
- [X] T047 [P] [US3] Add local two-player browser flow test in `apps/web/tests/local-two-player.spec.ts`

### Implementation for User Story 3

- [X] T048 [US3] Implement two-player keyboard mappings in `apps/web/src/controls/useLocalTwoPlayerKeyboard.ts`
- [X] T049 [US3] Implement split touch zones for two local players in `apps/web/src/controls/LocalTouchControls.tsx`
- [X] T050 [US3] Implement local two-player game screen in `apps/web/src/game/LocalTwoPlayerGame.tsx`
- [X] T051 [US3] Connect mode selection to local two-player flow in `apps/web/src/app/App.tsx`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T046 | QA engineer | T040-T041 | S | Tests prove both local players can move without input conflicts | P1 | 24 |
| T047 | QA engineer | T043 | M | Browser test completes a local two-player match | P1 | 24 |
| T048 | Frontend engineer | T046 | S | Desktop mappings control both paddles independently | P1 | 25 |
| T049 | Frontend engineer | T046 | M | Touch controls provide separate non-overlapping zones | P1 | 26 |
| T050 | Frontend engineer | T038-T048-T049 | M | Local two-player match uses shared scoring and HUD behavior | P1 | 27 |
| T051 | Frontend engineer | T050 | S | Mode selection starts and exits local two-player mode | P1 | 28 |

**Checkpoint**: User Story 3 is complete when one-device local two-player works independently on desktop and mobile viewport tests.

---

## Phase 5: Game Server, Real-Time Sync, and Multiplayer Session Handling - User Story 2 Online Two-Player Match (Priority: P2)

**Goal**: Two players in separate browsers can create/join an invite-only online session and complete a synchronized match with reconnect behavior.

**Independent Test**: Create a session in one browser, join from another, play a full match, pause/resume, restart, disconnect/reconnect within 30 seconds, and verify synchronized final score.

**Blockers and Risks**: Depends on Phase 2 contracts and game-core rules. Risk is unfair latency, session ownership ambiguity, and token leakage; keep backend authoritative and redacted.

### Tests for User Story 2

- [X] T052 [P] [US2] Add HTTP session contract tests in `apps/realtime/tests/session-routes.contract.test.ts`
- [X] T053 [P] [US2] Add realtime event schema tests in `apps/realtime/tests/realtime-events.contract.test.ts`
- [X] T054 [P] [US2] Add session lifecycle integration tests in `apps/realtime/tests/session-lifecycle.test.ts`
- [X] T055 [P] [US2] Add authoritative simulation integration tests in `apps/realtime/tests/online-simulation.test.ts`
- [X] T056 [P] [US2] Add two-browser online Playwright test in `apps/web/tests/online-two-player.spec.ts`

### Implementation for User Story 2

- [X] T057 [US2] Implement player token signing and verification in `apps/realtime/src/sessions/player-token.ts`
- [X] T058 [US2] Implement in-memory session repository with TTL cleanup in `apps/realtime/src/sessions/session-repository.ts`
- [X] T059 [US2] Implement session service for create, join, capacity, expiry, and reconnect state in `apps/realtime/src/sessions/session-service.ts`
- [X] T060 [US2] Implement HTTP session routes in `apps/realtime/src/http/session-routes.ts`
- [X] T061 [US2] Implement WebSocket connection registry and heartbeat handling in `apps/realtime/src/websocket/connection-registry.ts`
- [X] T062 [US2] Implement realtime input validation, sequencing, and rate limiting in `apps/realtime/src/websocket/input-validator.ts`
- [X] T063 [US2] Implement authoritative online match runner at fixed tick rate in `apps/realtime/src/sessions/online-match-runner.ts`
- [X] T064 [US2] Implement server-to-client snapshot and delta broadcaster in `apps/realtime/src/websocket/state-broadcaster.ts`
- [X] T065 [US2] Implement disconnect, reconnect, leave, and forfeit behavior in `apps/realtime/src/sessions/reconnect-service.ts`
- [X] T066 [US2] Register HTTP and WebSocket routes in `apps/realtime/src/server.ts`
- [X] T067 [P] [US2] Implement frontend API client for session create, join, and metadata in `apps/web/src/realtime/sessionApi.ts`
- [X] T068 [P] [US2] Implement frontend WebSocket client with protocol handling in `apps/web/src/realtime/realtimeClient.ts`
- [X] T069 [US2] Implement online lobby, join code, and waiting states in `apps/web/src/game/OnlineLobby.tsx`
- [X] T070 [US2] Implement online game screen with prediction and reconciliation in `apps/web/src/game/OnlineGame.tsx`
- [X] T071 [US2] Connect mode selection and join links to online flow in `apps/web/src/app/App.tsx`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T052 | QA engineer | T014 | M | Contract tests cover create, join, metadata, health success and errors | P0 | 29 |
| T053 | QA engineer | T015 | M | Contract tests validate all realtime envelopes and close-code cases | P0 | 29 |
| T054 | QA engineer | T052 | M | Integration tests cover create, join, duplicate/expired/full sessions | P0 | 30 |
| T055 | QA engineer | T018-T019-T034-T038 | M | Simulation tests prove backend scoring and state authority | P0 | 30 |
| T056 | QA engineer | T043 | M | Two browser E2E test proves online journey after implementation | P1 | 30 |
| T057 | Backend engineer | T022-T024 | M | Tokens are unguessable, scoped, expiring, and redacted in logs | P0 | 31 |
| T058 | Backend engineer | T013-T057 | M | Sessions expire and cleanup without persistence | P0 | 32 |
| T059 | Backend engineer | T058 | M | Create/join/capacity/reconnect rules match spec | P0 | 33 |
| T060 | Backend engineer | T052-T059 | M | HTTP routes satisfy OpenAPI contract and errors | P0 | 34 |
| T061 | Backend engineer | T015-T024 | M | WebSocket connections attach to session/player and heartbeat safely | P0 | 34 |
| T062 | Backend engineer | T053-T061 | M | Invalid, stale, unauthorized, and excessive inputs are rejected | P0 | 35 |
| T063 | Backend engineer | T055-T059-T062 | L | Backend owns authoritative 30 Hz match simulation | P0 | 36 |
| T064 | Backend engineer | T061-T063 | M | Snapshots/deltas are broadcast with sequence and timestamps | P0 | 37 |
| T065 | Backend engineer | T059-T064 | M | 30-second reconnect and forfeit behavior work predictably | P0 | 38 |
| T066 | Backend engineer | T060-T065 | S | Backend serves HTTP and WebSocket contracts from one process | P0 | 39 |
| T067 | Frontend engineer | T060 | M | Web app can create/join sessions through typed API client | P1 | 39 |
| T068 | Frontend engineer | T064 | M | Web app connects, sends input, handles snapshots/deltas/errors | P1 | 39 |
| T069 | Frontend engineer | T067 | M | Lobby shows join link/code, waiting, full, expired, and error states | P1 | 40 |
| T070 | Frontend engineer | T068-T069 | L | Online game is playable with prediction and state reconciliation | P1 | 41 |
| T071 | Frontend engineer | T070 | S | Mode selection and join URLs enter online flow correctly | P1 | 42 |

**Checkpoint**: User Story 2 is complete when two browsers can complete an online match through the backend and recover from a transient disconnect.

---

## Phase 6: Responsive UX and Accessibility - User Story 4 Play Comfortably on Desktop and Mobile (Priority: P3)

**Goal**: Supported desktop, tablet, and mobile browsers have usable layout, controls, HUD, keyboard navigation, and accessible non-gameplay interactions.

**Independent Test**: Run single-player and two-player flows at desktop, tablet, and phone viewports and verify no text/control/court overlap, no keyboard traps, and clear status communication.

**Blockers and Risks**: Depends on the client flows from US1, US2, and US3. Risk is late discovery of mobile layout defects; run viewport tests before release hardening.

### Tests for User Story 4

- [X] T072 [P] [US4] Add responsive viewport Playwright tests in `apps/web/tests/responsive-layout.spec.ts`
- [X] T073 [P] [US4] Add accessibility regression tests in `apps/web/tests/accessibility.spec.ts`
- [X] T074 [P] [US4] Add keyboard navigation tests for menus and controls in `apps/web/tests/keyboard-navigation.spec.ts`

### Implementation for User Story 4

- [X] T075 [US4] Implement responsive court sizing and orientation handling in `apps/web/src/game/useCourtLayout.ts`
- [X] T076 [US4] Implement accessible mode selection and status announcements in `apps/web/src/app/App.tsx`
- [X] T077 [US4] Refine HUD responsive behavior and contrast states in `apps/web/src/hud/GameHud.tsx`
- [X] T078 [US4] Refine touch target sizing and disabled/pressed states in `apps/web/src/controls/LocalTouchControls.tsx`
- [X] T079 [US4] Add reduced-motion and visual readability handling in `apps/web/src/app/styles.css`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T072 | QA engineer | T043-T050-T070 | M | Tests cover phone, tablet, and desktop layouts without overlap | P1 | 43 |
| T073 | QA engineer | T042-T069 | M | Automated accessibility checks report no critical menu/HUD issues | P1 | 43 |
| T074 | QA engineer | T044-T051-T071 | S | Keyboard can navigate mode, pause/resume, restart, and exit | P1 | 43 |
| T075 | Frontend engineer | T039-T072 | M | Court scales predictably across supported viewports/orientations | P1 | 44 |
| T076 | Frontend engineer | T073-T074 | M | Mode/status UI has labels, focus order, and status announcements | P1 | 45 |
| T077 | Frontend engineer | T042-T072 | S | HUD fits and remains readable in all supported viewports | P1 | 46 |
| T078 | Frontend engineer | T049-T072 | S | Touch controls have correct target size and visible states | P1 | 46 |
| T079 | Frontend engineer | T027-T073 | S | Reduced motion and contrast needs are supported | P1 | 47 |

**Checkpoint**: User Story 4 is complete when responsive and accessibility tests pass across the supported viewport matrix.

---

## Phase 7: Containerization and Kubernetes Setup - User Story 5 Deploy and Operate on Azure (Priority: P3)

**Goal**: Operators can build images, deploy frontend and backend to AKS, configure runtime settings/secrets, expose HTTPS/WSS traffic, and verify health.

**Independent Test**: Apply the dev overlay to AKS, wait for rollout, hit health endpoints through ingress, and play local and online matches through the public URL.

**Blockers and Risks**: Depends on app build outputs and backend health endpoints. Risk is WebSocket ingress behavior and unsafe backend scaling; keep backend active-session owner at one replica until distributed routing is implemented.

### Tests for User Story 5

- [X] T080 [P] [US5] Add Docker build smoke tests in `.github/workflows/ci.yml`
- [X] T081 [P] [US5] Add Kubernetes manifest validation command in `infra/k8s/kubeconform.config.yaml`
- [X] T082 [P] [US5] Add deployed AKS smoke test script in `scripts/smoke/aks-smoke.ts`

### Implementation for User Story 5

- [X] T083 [US5] Create production frontend Dockerfile with non-root runtime in `apps/web/Dockerfile`
- [X] T084 [US5] Create production backend Dockerfile with non-root runtime in `apps/realtime/Dockerfile`
- [X] T085 [US5] Add frontend runtime web server config in `apps/web/nginx.conf`
- [X] T086 [US5] Create Kubernetes namespace and shared labels in `infra/k8s/base/namespace.yaml`
- [X] T087 [US5] Create frontend Deployment and Service manifests in `infra/k8s/base/web.yaml`
- [X] T088 [US5] Create backend Deployment and Service manifests with probes and drain lifecycle in `infra/k8s/base/realtime.yaml`
- [X] T089 [US5] Create ConfigMap and Secret reference manifests in `infra/k8s/base/config.yaml`
- [X] T090 [US5] Create HTTPS ingress with `/`, `/api`, and `/ws` routes in `infra/k8s/base/ingress.yaml`
- [X] T091 [US5] Create safe HPA manifests with frontend scaling and documented backend replica limit in `infra/k8s/base/hpa.yaml`
- [X] T092 [US5] Create Kustomize base and overlays for dev, staging, and prod in `infra/k8s/kustomization.yaml`, `infra/k8s/overlays/dev/kustomization.yaml`, `infra/k8s/overlays/staging/kustomization.yaml`, and `infra/k8s/overlays/prod/kustomization.yaml`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T080 | DevOps engineer | T011 | S | CI builds both Docker images on pull requests | P1 | 48 |
| T081 | DevOps engineer | T092 | S | Manifest validation runs in CI and fails invalid YAML/schema | P1 | 48 |
| T082 | QA engineer | T060-T071 | M | Smoke script checks health, HTTPS, WSS, and basic gameplay route | P1 | 48 |
| T083 | DevOps engineer | T007-T010 | M | Frontend image builds reproducibly and runs as non-root | P1 | 49 |
| T084 | DevOps engineer | T008-T010-T025 | M | Backend image builds reproducibly and runs as non-root | P1 | 49 |
| T085 | DevOps engineer | T083 | S | Frontend serves static assets with safe cache behavior | P1 | 50 |
| T086 | DevOps engineer | T083-T084 | S | Namespace manifest applies cleanly | P1 | 51 |
| T087 | DevOps engineer | T083-T086 | M | Frontend Deployment/Service roll out and expose internal service | P1 | 52 |
| T088 | DevOps engineer | T084-T086 | M | Backend probes and lifecycle support readiness and drain behavior | P1 | 52 |
| T089 | DevOps engineer | T022-T023-T086 | M | Required config and secret refs are represented without hardcoded secrets | P1 | 53 |
| T090 | DevOps engineer | T087-T089 | M | Ingress routes frontend, `/api`, and `/ws` correctly | P1 | 54 |
| T091 | DevOps engineer | T087-T088 | S | HPA documents frontend scaling and backend v1 replica safety | P1 | 55 |
| T092 | DevOps engineer | T086-T091 | M | Dev/staging/prod overlays apply with environment-specific values | P1 | 56 |

**Checkpoint**: User Story 5 deployment base is complete when manifests validate and the dev overlay can serve the game through ingress.

---

## Phase 8: Azure Deployment and Infrastructure

**Purpose**: Provision and wire Azure resources needed by the AKS deployment and CI/CD promotion workflow.

**Blockers and Risks**: Requires Azure subscription permissions and environment naming decisions. Risk is over-provisioning; use cost-conscious defaults and document production scaling assumptions.

### Tasks

- [X] T093 Create Azure resource provisioning guide in `infra/azure/README.md`
- [X] T094 [P] Create Azure Container Registry setup script in `infra/azure/acr.sh`
- [X] T095 [P] Create AKS cluster setup script with ACR attachment and Key Vault CSI addon in `infra/azure/aks.sh`
- [X] T096 [P] Create Key Vault secret setup script for `SESSION_TOKEN_SIGNING_SECRET` in `infra/azure/keyvault.sh`
- [X] T097 Create GitHub Actions deploy workflow for immutable image push and dev deploy in `.github/workflows/deploy.yml`
- [X] T098 Add staging and production-style promotion gates to `.github/workflows/deploy.yml`
- [X] T099 Document local-to-AKS workflow and rollback commands in `docs/deployment/aks-runbook.md`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T093 | DevOps engineer | T092 | S | Guide names required Azure resources, permissions, and cost defaults | P1 | 57 |
| T094 | DevOps engineer | T093 | S | ACR script documents variables and creates/picks registry | P1 | 58 |
| T095 | DevOps engineer | T093 | M | AKS script documents node pool, ACR attach, Key Vault CSI, monitoring | P1 | 58 |
| T096 | DevOps engineer | T093 | S | Key Vault script creates required secret without committing values | P1 | 58 |
| T097 | DevOps engineer | T080-T092-T094 | M | Main branch pushes immutable images and deploys dev overlay | P1 | 59 |
| T098 | DevOps engineer | T097 | M | Staging/prod-style promotion requires tests and manual approval | P1 | 60 |
| T099 | SRE engineer | T095-T098 | M | Runbook supports deploy, verify, and rollback from quickstart | P1 | 61 |

**Checkpoint**: Azure deployment is ready when CI can build/push/deploy to dev and promotion gates are documented.

---

## Phase 9: Observability and Operations

**Purpose**: Add metrics, dashboards, alerts, operational logs, and runtime safety for gameplay and AKS operations.

**Blockers and Risks**: Depends on backend lifecycle and Azure monitoring setup. Risk is noisy or sensitive logs; metrics and logs must be useful without exposing tokens.

### Tasks

- [X] T100 [P] Implement backend metrics endpoint for sessions, connections, tick duration, rejected inputs, disconnects, and reconnects in `apps/realtime/src/observability/metrics.ts`
- [X] T101 [P] Add frontend performance metric capture for startup, frame rate, and input latency in `apps/web/src/app/performanceMetrics.ts`
- [X] T102 Add backend graceful shutdown and readiness drain handling in `apps/realtime/src/server.ts`
- [X] T103 Add token redaction and correlation id tests in `apps/realtime/tests/observability.test.ts`
- [X] T104 Create Azure Monitor dashboard definition notes in `docs/operations/dashboard.md`
- [X] T105 Create alert rule documentation for errors, readiness, disconnects, tick lag, and capacity in `docs/operations/alerts.md`
- [X] T106 Add operational capacity and backend single-replica limit documentation in `docs/operations/capacity.md`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T100 | Backend engineer | T024-T063 | M | `/metrics` exposes required gameplay and service metrics | P1 | 62 |
| T101 | Frontend engineer | T045 | S | Frontend captures startup, frame, and input budget signals | P1 | 62 |
| T102 | Backend engineer | T025-T065-T088 | M | Readiness fails during drain and shutdown respects reconnect behavior | P1 | 63 |
| T103 | QA engineer | T024-T100 | S | Tests prove token redaction and correlation id logging | P1 | 64 |
| T104 | SRE engineer | T100-T101 | M | Dashboard doc maps metrics/logs to Azure Monitor panels | P1 | 65 |
| T105 | SRE engineer | T100-T104 | S | Alert doc covers release-blocking operational signals | P1 | 66 |
| T106 | SRE engineer | T091-T100 | S | Capacity doc states 100-match target and backend scaling caveat | P1 | 66 |

**Checkpoint**: Operations work is complete when logs, metrics, dashboards, alerts, and drain behavior can be verified in a production-like environment.

---

## Phase 10: Testing and Quality Assurance

**Purpose**: Close cross-story quality gaps, verify performance/security budgets, and prove the full MVP release behaves as one product.

**Blockers and Risks**: Depends on all MVP stories and deployment base. Risk is discovering performance issues late; run T111 and T112 as soon as online deployment is available.

### Tasks

- [X] T107 Run and fix lint, format, and typecheck failures across `package.json`
- [X] T108 Run and fix unit and contract test failures across `packages/game-core/tests/`, `packages/contracts/tests/`, and `apps/realtime/tests/`
- [X] T109 Run and fix Playwright E2E failures across `apps/web/tests/`
- [X] T110 Run and fix accessibility issues found by `apps/web/tests/accessibility.spec.ts`
- [X] T111 Implement frame-rate and input-latency performance test script in `scripts/perf/browser-performance.ts`
- [X] T112 Implement WebSocket load test for 100 concurrent online matches in `scripts/perf/ws-load.ts`
- [X] T113 Implement malformed event and token abuse security test script in `scripts/security/realtime-abuse.ts`
- [X] T114 Validate quickstart commands and update mismatches in `specs/001-multiplayer-ping-pong/quickstart.md`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T107 | Full-stack engineer | T001-T106 | M | Lint, format, and typecheck pass cleanly | P0 | 67 |
| T108 | QA engineer | T001-T106 | M | Unit and contract test suites pass cleanly | P0 | 68 |
| T109 | QA engineer | T043-T051-T071-T079 | M | E2E tests pass for single-player, local, online, reconnect | P0 | 69 |
| T110 | QA engineer | T073-T079 | S | No critical accessibility issues remain | P1 | 70 |
| T111 | QA engineer | T045-T101 | M | Desktop/mobile frame and input budgets are measured and pass | P1 | 71 |
| T112 | QA engineer | T063-T092-T100 | M | 100 concurrent online match load target is measured and pass/fail recorded | P1 | 72 |
| T113 | Security engineer | T057-T062 | M | Invalid tokens/events cannot move paddles, score points, or control sessions | P0 | 73 |
| T114 | Technical writer | T107-T113 | S | Quickstart commands match implemented scripts and deployment flow | P1 | 74 |

**Checkpoint**: QA is complete when automated checks and documented manual verifications meet the Definition of Done.

---

## Phase 11: Release Preparation

**Purpose**: Final release readiness, documentation, smoke testing, rollout, rollback, and sign-off.

**Blockers and Risks**: Depends on all MVP release tasks. Risk is release drift; use same image tags through dev, staging, and production-style promotion.

### Tasks

- [X] T115 Create release checklist mapped to acceptance criteria in `docs/release/release-checklist.md`
- [X] T116 Create production smoke test procedure in `docs/release/smoke-test.md`
- [X] T117 Create incident triage and rollback runbook in `docs/operations/incident-runbook.md`
- [X] T118 Record staging load, latency, accessibility, and security evidence in `docs/release/release-evidence.md`
- [X] T119 Tag and document first releasable image versions in `docs/release/version-manifest.md`
- [X] T120 Execute final release sign-off and update status in `specs/001-multiplayer-ping-pong/tasks.md`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T115 | Technical program manager | T107-T114 | S | Checklist covers AC-001 through AC-010 | P0 | 75 |
| T116 | QA engineer | T082-T109 | S | Smoke test can be followed by an operator after deploy | P0 | 76 |
| T117 | SRE engineer | T099-T102 | M | Incident runbook covers rollback, logs, metrics, and escalation | P1 | 77 |
| T118 | QA engineer | T110-T113 | M | Release evidence records pass/fail for all release gates | P0 | 78 |
| T119 | DevOps engineer | T097-T098-T118 | S | Version manifest names immutable frontend/backend image tags | P0 | 79 |
| T120 | Technical program manager | T115-T119 | S | Final sign-off records release readiness or explicit blockers | P0 | 80 |

**Checkpoint**: Release preparation is complete when the team can deploy, smoke test, observe, and roll back the first release with documented evidence.

---

## Phase 12: Deferred Tasks

**Purpose**: Capture valuable work explicitly excluded from the first release so the MVP stays focused.

**Blockers and Risks**: Do not start before MVP release unless product scope changes. Several tasks require persistence, moderation, or distributed session ownership.

### Deferred Nice-to-Have Tasks

- [X] T121 [P] Add public matchmaking queue design in `specs/001-multiplayer-ping-pong/deferred/public-matchmaking.md`
- [X] T122 [P] Add user profiles and authentication design in `specs/001-multiplayer-ping-pong/deferred/user-profiles.md`
- [X] T123 [P] Add match history and leaderboard persistence design in `specs/001-multiplayer-ping-pong/deferred/history-leaderboards.md`
- [X] T124 [P] Add Redis or Azure Web PubSub distributed session ownership design in `specs/001-multiplayer-ping-pong/deferred/distributed-realtime.md`
- [X] T125 [P] Add spectator mode and replay design in `specs/001-multiplayer-ping-pong/deferred/spectators-replays.md`
- [X] T126 [P] Add branded audio/visual theme backlog in `specs/001-multiplayer-ping-pong/deferred/brand-polish.md`

### Task Details

| Task | Owner | Dependencies | Size | Acceptance Criteria | Priority | Order |
|------|-------|--------------|------|---------------------|----------|-------|
| T121 | Product engineer | MVP release | M | Public matchmaking scope, risks, and storage needs are defined | P3 | Deferred |
| T122 | Full-stack engineer | MVP release | M | Auth/profile options and privacy impacts are defined | P3 | Deferred |
| T123 | Backend engineer | T122 | M | Persistence model and anti-cheat implications are defined | P3 | Deferred |
| T124 | Backend engineer | MVP release load evidence | L | Distributed session routing plan is ready before backend multi-replica ownership | P3 | Deferred |
| T125 | Frontend engineer | MVP release | M | Spectator/replay UX and backend implications are defined | P3 | Deferred |
| T126 | Designer/frontend engineer | MVP release | M | Visual/audio theme backlog is scoped without disrupting gameplay clarity | P3 | Deferred |

**Checkpoint**: Deferred work remains out of MVP unless explicitly pulled into a future spec.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies and can start immediately.
- **Phase 2**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 / US1**: Depends on Phase 2. This is the first independently playable MVP slice.
- **Phase 4 / US3**: Depends on Phase 3 local game loop. Can run before or alongside backend online work after US1 engine pieces are stable.
- **Phase 5 / US2**: Depends on Phase 2, game-core rules from Phase 3, and contract schemas.
- **Phase 6 / US4**: Depends on client flows from US1, US2, and US3.
- **Phase 7 / US5**: Depends on buildable web/backend apps and health endpoints. Can begin Docker/Kubernetes scaffolding while US2 finishes, but AKS smoke tests depend on US2.
- **Phase 8**: Depends on Phase 7 manifest shape and Azure access.
- **Phase 9**: Depends on backend lifecycle, metrics, and deployed environment.
- **Phase 10**: Depends on all MVP implementation phases.
- **Phase 11**: Depends on Phase 10 evidence.
- **Phase 12**: Deferred until after MVP release.

### User Story Dependencies

- **US1 Play Against AI**: Can start after Phase 2. No dependency on other user stories.
- **US3 Local Two-Player**: Depends on US1 local match engine and renderer.
- **US2 Online Two-Player**: Depends on Phase 2 contracts and US1 game-core rules, but can be developed in parallel with US3 after core rules stabilize.
- **US4 Responsive Desktop/Mobile**: Depends on playable client flows from US1, US2, and US3.
- **US5 Deploy and Operate on Azure**: Depends on app build outputs and backend health/metrics, but infrastructure scaffolding can start earlier.

### MVP Scope

- **Initial playable MVP demo**: Complete Phases 1-3 for single-player AI.
- **First release MVP**: Complete Phases 1-11, excluding Phase 12 deferred tasks.

---

## Parallel Execution Examples

### Setup Parallel Work

```text
T003 TypeScript config, T004 lint/format config, T005 Vitest config, and T006 Playwright config can run together after T001.
T007 web scaffold, T008 backend scaffold, and T009 package manifests can run together after shared tooling is in place.
```

### US1 Parallel Work

```text
T029-T033 tests can run in parallel once Phase 2 is done.
T039 renderer, T040 keyboard controls, and T041 touch controls can run while gameplay engine tasks T034-T038 are underway.
```

### US2 Parallel Work

```text
T052-T056 tests can run in parallel before backend implementation.
T067 frontend API client and T068 realtime client can run in parallel with backend session routes after contracts stabilize.
```

### US5 Parallel Work

```text
T083 frontend image and T084 backend image can run together.
T094 ACR, T095 AKS, and T096 Key Vault scripts can run together after T093 defines Azure naming and variables.
```

---

## Implementation Strategy

1. Complete Phases 1-2 and stop for a foundation review.
2. Complete Phase 3 and demo a single-player match as the first playable slice.
3. Complete Phase 4 to prove all local gameplay paths before relying on the network.
4. Complete Phase 5 to add online play with authoritative backend state and reconnect.
5. Complete Phase 6 to harden the browser experience across desktop and mobile.
6. Complete Phases 7-9 to make the game deployable and operable on AKS.
7. Complete Phases 10-11 to prove release quality, record evidence, and ship.
8. Keep Phase 12 deferred until a new scope decision is made.

---

## Format Validation

- All executable task lines use `- [ ] T###` checklist format.
- Tasks marked `[P]` are parallelizable because they touch different files or depend only on completed prerequisites.
- User story phase tasks include `[US1]`, `[US2]`, `[US3]`, `[US4]`, or `[US5]`.
- Setup, foundational, polish, release, and deferred phases omit story labels unless the task belongs to a user story phase.
- Every task description includes at least one concrete file path.

## Implementation Status

- Local implementation gates pass for lint, formatting, typecheck, unit/integration tests, production build, and Playwright desktop/mobile browser tests.
- Release evidence is recorded in `docs/release/release-evidence.md`.
- External release blockers remain for environments that require Docker, kubectl, and Azure credentials: image build smoke tests, manifest validation, AKS smoke tests, and 100-match load validation.
