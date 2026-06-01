# Tasks: Virtual Player Simulation and Cluster Load Testing

**Input**: Design documents from `specs/002-virtual-player-simulation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml), [contracts/simulation-metrics.md](./contracts/simulation-metrics.md), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are required by the project constitution and this feature's validation goals. Write the test tasks first in each story phase and verify they fail before implementation.

**Organization**: Tasks are grouped by dependency phase and user story. Each user story is independently testable after the foundational simulator service pieces are complete.

**User Input Coverage**:

- Backend: simulator service, bot behavior engine, WebSocket client pool, Prometheus metrics
- Frontend: simulation control panel, simulation status dashboard
- Infrastructure: load-generator deployment, scaling, monitoring dashboards
- Testing: 100-player validation, 1,000-player validation, HPA scaling validation

## Phase 1: Setup

**Purpose**: Add the simulator workspace shell, local developer entry points, and CI awareness.

- [X] T001 Create simulator workspace manifest in `apps/simulator/package.json`
- [X] T002 Create simulator TypeScript project config in `apps/simulator/tsconfig.json`
- [X] T003 [P] Create simulator server entry scaffold in `apps/simulator/src/server.ts`
- [X] T004 [P] Create simulator test fixture scaffold in `apps/simulator/tests/fixtures/simulation-fixtures.ts`
- [X] T005 Add simulator workspace scripts to the root npm scripts in `package.json`
- [X] T006 Add local simulator environment example values in `.env.example`
- [X] T007 [P] Create simulator Dockerfile scaffold in `apps/simulator/Dockerfile`
- [X] T008 [P] Add simulator local development notes in `README.md`
- [X] T009 [P] Add simulator test setup utilities in `apps/simulator/tests/setup.ts`
- [X] T010 Add simulator build and test coverage to CI in `.github/workflows/ci.yml`

---

## Phase 2: Foundational

**Purpose**: Shared contracts, environment loading, auth guard, health, and state-machine pieces that block all user stories.

**Critical**: No user story work should begin until this phase is complete.

- [X] T011 Define simulation domain types in `packages/contracts/src/simulation.ts`
- [X] T012 Export simulation contract types from `packages/contracts/src/index.ts`
- [X] T013 [P] Add simulation contract tests in `packages/contracts/tests/simulation-contracts.test.ts`
- [X] T014 Add simulation HTTP validators in `packages/contracts/src/simulation-http.ts`
- [X] T015 Implement simulator environment loader in `apps/simulator/src/config/env.ts`
- [X] T016 [P] Add simulator environment validation tests in `apps/simulator/tests/env.test.ts`
- [X] T017 Add simulator structured logger in `apps/simulator/src/observability/logger.ts`
- [X] T018 Add simulator health routes in `apps/simulator/src/http/health-routes.ts`
- [X] T019 Add simulator admin authorization guard in `apps/simulator/src/http/admin-auth.ts`
- [X] T020 [P] Add admin authorization tests in `apps/simulator/tests/admin-auth.test.ts`
- [X] T021 Add simulator HTTP error response helpers in `apps/simulator/src/http/error-response.ts`
- [X] T022 Implement simulation run state machine in `apps/simulator/src/orchestration/run-state-machine.ts`
- [X] T023 [P] Add run state-machine tests in `apps/simulator/tests/run-state-machine.test.ts`
- [X] T024 Wire config, logging, health, auth, and error handling in `apps/simulator/src/server.ts`

**Checkpoint**: Simulator service can start, expose health, validate env, and reject unauthorized admin requests.

---

## Phase 3: User Story 1 - Start and Stop a Simulation (Priority: P1, MVP)

**Goal**: An administrator can start a 100-player simulation from the UI, observe running state, and stop it cleanly.

**Independent Test**: Use the admin UI to start a 100-player run, confirm active virtual players and matches appear, stop the run, and confirm virtual players disconnect and the run becomes stopped/completed.

### Tests for User Story 1

- [X] T025 [P] [US1] Add admin API contract tests for list, start, get, and stop in `apps/simulator/tests/simulation-routes.contract.test.ts`
- [X] T026 [P] [US1] Add simulation lifecycle service tests in `apps/simulator/tests/simulation-lifecycle.test.ts`
- [X] T027 [P] [US1] Add basic virtual player integration test against realtime paths in `apps/simulator/tests/virtual-player-basic.integration.test.ts`
- [X] T028 [P] [US1] Add Playwright admin start/stop smoke test in `apps/web/tests/admin-simulation-start-stop.spec.ts`

### Implementation for User Story 1

- [X] T029 [P] [US1] Create in-memory simulation run repository in `apps/simulator/src/orchestration/simulation-repository.ts`
- [X] T030 [P] [US1] Create run summary mapper in `apps/simulator/src/orchestration/run-summary.ts`
- [X] T031 [US1] Implement start, stop, list, and get operations in `apps/simulator/src/orchestration/simulation-service.ts`
- [X] T032 [US1] Implement admin simulation routes in `apps/simulator/src/http/simulation-routes.ts`
- [X] T033 [P] [US1] Implement target session API client in `apps/simulator/src/virtual-player/session-api-client.ts`
- [X] T034 [P] [US1] Implement realtime WebSocket client wrapper in `apps/simulator/src/virtual-player/realtime-client.ts`
- [X] T035 [US1] Implement basic virtual player worker lifecycle in `apps/simulator/src/virtual-player/virtual-player-worker.ts`
- [X] T036 [US1] Implement two-player simulated match orchestration in `apps/simulator/src/orchestration/match-orchestrator.ts`
- [X] T037 [US1] Connect cancellation and cleanup from simulation service to match orchestration in `apps/simulator/src/orchestration/simulation-service.ts`
- [X] T038 [P] [US1] Add simulator admin API client for the web app in `apps/web/src/admin/simulationApi.ts`
- [X] T039 [P] [US1] Add administrator access gate component in `apps/web/src/admin/AdminAccessGate.tsx`
- [X] T040 [US1] Add simulation control panel start/stop shell in `apps/web/src/admin/SimulationControlPanel.tsx`
- [X] T041 [US1] Add admin simulation entry point to the app shell in `apps/web/src/app/App.tsx`
- [X] T042 [US1] Add admin panel layout and state styles in `apps/web/src/app/styles.css`
- [X] T043 [US1] Add local dev proxy for simulator admin API in `apps/web/vite.config.ts`
- [X] T044 [US1] Document 100-player MVP validation steps in `specs/002-virtual-player-simulation/quickstart.md`

**Checkpoint**: User Story 1 is independently usable as the MVP simulator: admin can start and stop a 100-player run.

---

## Phase 4: User Story 2 - Configure Realistic Load Profiles (Priority: P1)

**Goal**: Administrators can configure player count, match count, duration, behavior profile, update frequency, disconnect rate, and reconnect rate before launching a run.

**Independent Test**: Submit valid and invalid configurations from the UI, confirm invalid values are rejected, and confirm running virtual players follow selected behavior and reconnect settings.

### Tests for User Story 2

- [X] T045 [P] [US2] Add simulation configuration validation tests in `apps/simulator/tests/simulation-config.test.ts`
- [X] T046 [P] [US2] Add behavior profile engine tests in `apps/simulator/tests/behavior-profiles.test.ts`
- [X] T047 [P] [US2] Add disconnect and reconnect scheduler tests in `apps/simulator/tests/disconnect-reconnect.test.ts`
- [X] T048 [P] [US2] Add Playwright configuration form validation test in `apps/web/tests/admin-simulation-config.spec.ts`

### Implementation for User Story 2

- [X] T049 [US2] Implement simulation configuration validator in `apps/simulator/src/orchestration/simulation-config.ts`
- [X] T050 [P] [US2] Implement behavior profile definitions in `apps/simulator/src/virtual-player/behavior-profiles.ts`
- [X] T051 [P] [US2] Implement deterministic seeded random helper in `apps/simulator/src/virtual-player/seeded-random.ts`
- [X] T052 [US2] Implement bot paddle decision engine in `apps/simulator/src/virtual-player/bot-behavior-engine.ts`
- [X] T053 [US2] Integrate bot behavior engine with virtual player worker in `apps/simulator/src/virtual-player/virtual-player-worker.ts`
- [X] T054 [P] [US2] Implement disconnect and reconnect scheduler in `apps/simulator/src/virtual-player/disconnect-scheduler.ts`
- [X] T055 [US2] Integrate disconnect and reconnect behavior into match orchestration in `apps/simulator/src/orchestration/match-orchestrator.ts`
- [X] T056 [P] [US2] Add simulation configuration form component in `apps/web/src/admin/SimulationConfigForm.tsx`
- [X] T057 [US2] Wire configuration form values into the control panel in `apps/web/src/admin/SimulationControlPanel.tsx`
- [X] T058 [US2] Add validation error display to the configuration form in `apps/web/src/admin/SimulationConfigForm.tsx`
- [X] T059 [US2] Add simulator admin URL and token config handling in `apps/web/src/app/config.ts`
- [X] T060 [US2] Document behavior profile and reconnect examples in `specs/002-virtual-player-simulation/quickstart.md`

**Checkpoint**: User Story 2 is independently testable by launching different accepted profiles and confirming rejected invalid configurations.

---

## Phase 5: User Story 3 - Validate 1,000-Player Cluster Behavior (Priority: P2)

**Goal**: Operators can run the simulator at 1,000 virtual players in Kubernetes and validate simulator HPA behavior without scaling realtime active-session ownership beyond safe limits.

**Independent Test**: Run the 1,000-player cluster validation flow, collect HPA/pod evidence, and confirm real gameplay control sessions remain correct.

### Tests for User Story 3

- [X] T061 [P] [US3] Add WebSocket client pool unit tests in `apps/simulator/tests/websocket-client-pool.test.ts`
- [X] T062 [P] [US3] Add 100-player smoke validation script in `scripts/smoke/simulation-100.ts`
- [X] T063 [P] [US3] Add 1,000-player cluster validation script in `scripts/perf/simulation-1000.ts`
- [X] T064 [P] [US3] Add HPA evidence collection script in `scripts/perf/simulation-hpa-validation.ts`
- [X] T065 [P] [US3] Add Kubernetes render validation script in `scripts/smoke/simulation-k8s-render.ts`

### Implementation for User Story 3

- [X] T066 [US3] Implement WebSocket client pool in `apps/simulator/src/virtual-player/websocket-client-pool.ts`
- [X] T067 [US3] Add simulator concurrency limiter in `apps/simulator/src/orchestration/concurrency-limiter.ts`
- [X] T068 [US3] Add batch match allocation for 1,000 players in `apps/simulator/src/orchestration/match-orchestrator.ts`
- [X] T069 [US3] Add resource-safe stop and shutdown behavior in `apps/simulator/src/orchestration/simulation-service.ts`
- [X] T070 [P] [US3] Create simulator Kubernetes Deployment and Service in `infra/k8s/base/simulator.yaml`
- [X] T071 [P] [US3] Create simulator HorizontalPodAutoscaler in `infra/k8s/base/simulator-hpa.yaml`
- [X] T072 [US3] Include simulator manifests in the base kustomization in `infra/k8s/base/kustomization.yaml`
- [X] T073 [US3] Add simulator runtime configuration values in `infra/k8s/base/config.yaml`
- [X] T074 [US3] Add `/admin/simulations` ingress routing to simulator service in `infra/k8s/base/ingress.yaml`
- [X] T075 [P] [US3] Add simulator dev overlay values in `infra/k8s/overlays/dev/kustomization.yaml`
- [X] T076 [P] [US3] Add simulator staging and production overlay values in `infra/k8s/overlays/staging/kustomization.yaml` and `infra/k8s/overlays/prod/kustomization.yaml`
- [X] T077 [US3] Add simulator image build and deployment steps in `.github/workflows/deploy.yml`
- [X] T078 [US3] Add simulator smoke and performance npm scripts in `package.json`
- [X] T079 [US3] Write HPA validation runbook in `docs/operations/simulation-hpa-validation.md`

**Checkpoint**: User Story 3 is independently testable in a non-production cluster with 100-player and 1,000-player validation scripts and HPA evidence.

---

## Phase 6: User Story 4 - Monitor Simulation Metrics (Priority: P2)

**Goal**: Operators can see simulation status and Prometheus-compatible metrics for active virtual players, matches, connections, message rate, runs, and failures.

**Independent Test**: Run a simulation and verify the admin dashboard and metrics endpoint agree within the configured accuracy budget.

### Tests for User Story 4

- [X] T080 [P] [US4] Add simulator metrics contract tests in `apps/simulator/tests/simulation-metrics.contract.test.ts`
- [X] T081 [P] [US4] Add Playwright status dashboard test in `apps/web/tests/admin-simulation-dashboard.spec.ts`
- [X] T082 [P] [US4] Add metrics smoke validation script in `scripts/smoke/simulation-metrics.ts`

### Implementation for User Story 4

- [X] T083 [US4] Implement simulator metrics registry in `apps/simulator/src/metrics/simulation-metrics.ts`
- [X] T084 [US4] Implement Prometheus-compatible metrics route in `apps/simulator/src/http/metrics-routes.ts`
- [X] T085 [US4] Wire run lifecycle counters and gauges into simulation service in `apps/simulator/src/orchestration/simulation-service.ts`
- [X] T086 [US4] Wire WebSocket connection and message counters into the client pool in `apps/simulator/src/virtual-player/websocket-client-pool.ts`
- [X] T087 [P] [US4] Add simulation status polling hook in `apps/web/src/admin/useSimulationPolling.ts`
- [X] T088 [P] [US4] Add simulation status dashboard component in `apps/web/src/admin/SimulationStatusDashboard.tsx`
- [X] T089 [US4] Integrate status dashboard into the control panel in `apps/web/src/admin/SimulationControlPanel.tsx`
- [X] T090 [US4] Add dashboard visual states and responsive styles in `apps/web/src/app/styles.css`
- [X] T091 [P] [US4] Document simulation metrics contract in `docs/operations/simulation-metrics.md`
- [X] T092 [P] [US4] Add monitoring dashboard specification in `docs/operations/simulation-dashboard.md`
- [X] T093 [US4] Add simulation alert recommendations in `docs/operations/simulation-alerts.md`

**Checkpoint**: User Story 4 is independently testable by comparing UI status to the metrics endpoint during a running simulation.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Documentation, security hardening, release evidence, and final validation across all stories.

- [X] T094 [P] Update AKS and EKS simulator deployment instructions in `README.md`
- [X] T095 [P] Update AKS deployment runbook for simulator operations in `docs/deployment/aks-runbook.md`
- [X] T096 [P] Update incident response guidance for simulator overload and cleanup in `docs/operations/incident-runbook.md`
- [X] T097 [P] Add admin simulation security checklist in `docs/security/simulation-admin-controls.md`
- [X] T098 Add simulator release evidence template in `docs/release/simulation-release-evidence.md`
- [X] T099 Run lint, format, typecheck, and unit tests and record results in `docs/release/simulation-validation.md`
- [X] T100 Run 100-player local or cluster smoke validation and record results in `docs/release/simulation-validation.md`
- [ ] T101 Run 1,000-player non-production validation and record results in `docs/release/simulation-validation.md`
- [ ] T102 Run HPA scaling validation and record events in `docs/release/simulation-validation.md`
- [X] T103 Run production-disabled and non-admin access validation and record results in `docs/release/simulation-validation.md`

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP.
- **Phase 4 US2**: Depends on Phase 2; integrates with US1 control panel but can be developed with mocks after foundational contracts exist.
- **Phase 5 US3**: Depends on Phase 2 and the simulator engine from US1/US2 for realistic 1,000-player validation.
- **Phase 6 US4**: Depends on Phase 2; useful with US1, and required before full release validation.
- **Phase 7 Polish**: Depends on the user stories selected for release.

### User Story Dependencies

- **US1 Start and Stop a Simulation**: MVP; no dependency on other user stories after foundation.
- **US2 Configure Realistic Load Profiles**: Can start after foundation, but final integration depends on US1 control panel and simulator service.
- **US3 Validate 1,000-Player Cluster Behavior**: Depends on US1 start/stop and US2 profile/update behavior for realistic load.
- **US4 Monitor Simulation Metrics**: Can start after foundation and can integrate incrementally with US1 lifecycle events.

### Parallel Opportunities

- Setup scaffolding tasks T003, T004, T007, T008, and T009 can run in parallel.
- Foundational tests T013, T016, T020, and T023 can run in parallel with their corresponding implementations after interfaces are agreed.
- US1 tests T025-T028 can be written in parallel before implementation.
- US1 backend client/repository tasks T029, T030, T033, and T034 can run in parallel.
- US2 test tasks T045-T048 can run in parallel.
- US2 behavior profile, seeded random, scheduler, and UI form tasks T050, T051, T054, and T056 can run in parallel.
- US3 scripts and Kubernetes manifests T061-T065, T070, T071, T075, and T076 can run in parallel after foundational config names are agreed.
- US4 tests, polling hook, dashboard component, and docs T080-T082, T087, T088, T091, and T092 can run in parallel.

---

## Parallel Execution Examples

### User Story 1

```text
Task: T025 Add admin API contract tests in apps/simulator/tests/simulation-routes.contract.test.ts
Task: T026 Add lifecycle service tests in apps/simulator/tests/simulation-lifecycle.test.ts
Task: T027 Add virtual player integration test in apps/simulator/tests/virtual-player-basic.integration.test.ts
Task: T028 Add Playwright start/stop test in apps/web/tests/admin-simulation-start-stop.spec.ts
Task: T033 Implement target session API client in apps/simulator/src/virtual-player/session-api-client.ts
Task: T034 Implement realtime WebSocket client wrapper in apps/simulator/src/virtual-player/realtime-client.ts
Task: T038 Add web API client in apps/web/src/admin/simulationApi.ts
Task: T039 Add admin access gate in apps/web/src/admin/AdminAccessGate.tsx
```

### User Story 2

```text
Task: T045 Add config validation tests in apps/simulator/tests/simulation-config.test.ts
Task: T046 Add behavior profile tests in apps/simulator/tests/behavior-profiles.test.ts
Task: T047 Add disconnect/reconnect tests in apps/simulator/tests/disconnect-reconnect.test.ts
Task: T048 Add UI form validation test in apps/web/tests/admin-simulation-config.spec.ts
Task: T050 Implement behavior profile definitions in apps/simulator/src/virtual-player/behavior-profiles.ts
Task: T051 Implement seeded random helper in apps/simulator/src/virtual-player/seeded-random.ts
Task: T056 Add config form in apps/web/src/admin/SimulationConfigForm.tsx
```

### User Story 3

```text
Task: T062 Add 100-player smoke script in scripts/smoke/simulation-100.ts
Task: T063 Add 1,000-player validation script in scripts/perf/simulation-1000.ts
Task: T064 Add HPA evidence script in scripts/perf/simulation-hpa-validation.ts
Task: T070 Create simulator Kubernetes Deployment and Service in infra/k8s/base/simulator.yaml
Task: T071 Create simulator HPA in infra/k8s/base/simulator-hpa.yaml
Task: T075 Add dev overlay values in infra/k8s/overlays/dev/kustomization.yaml
Task: T076 Add staging/prod overlay values in infra/k8s/overlays/staging/kustomization.yaml and infra/k8s/overlays/prod/kustomization.yaml
```

### User Story 4

```text
Task: T080 Add metrics contract tests in apps/simulator/tests/simulation-metrics.contract.test.ts
Task: T081 Add dashboard Playwright test in apps/web/tests/admin-simulation-dashboard.spec.ts
Task: T082 Add metrics smoke script in scripts/smoke/simulation-metrics.ts
Task: T087 Add polling hook in apps/web/src/admin/useSimulationPolling.ts
Task: T088 Add dashboard component in apps/web/src/admin/SimulationStatusDashboard.tsx
Task: T091 Document metrics contract in docs/operations/simulation-metrics.md
Task: T092 Add dashboard specification in docs/operations/simulation-dashboard.md
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 only.
3. Validate the admin can start and stop a 100-player simulation.
4. Stop and demo the MVP before adding configuration, 1,000-player validation, or dashboard work.

### Incremental Delivery

1. Phase 3 delivers basic start/stop load generation.
2. Phase 4 adds realistic configuration and bot behavior profiles.
3. Phase 6 adds metrics visibility that can be used during validation.
4. Phase 5 adds Kubernetes deployment and HPA validation capacity.
5. Phase 7 produces release evidence and production-safety validation.

### Team Parallelization

After Phase 2:

- Backend engineer: US1 simulator lifecycle, then US2 bot behavior and WebSocket pool.
- Frontend engineer: US1 admin shell, then US2 config form and US4 dashboard.
- Platform engineer: US3 Kubernetes deployment, scaling, scripts, and HPA evidence.
- QA/automation engineer: story tests, 100-player validation, 1,000-player validation, and regression evidence.

## Notes

- Keep simulator traffic on the same public session and WebSocket paths used by real players.
- Keep realtime backend active-session replicas capped until distributed session ownership exists.
- Keep production simulation disabled by default.
- Do not add high-cardinality labels such as run id, session id, player id, or token to default metrics.
- Verify every test task fails before the corresponding implementation task is complete.
