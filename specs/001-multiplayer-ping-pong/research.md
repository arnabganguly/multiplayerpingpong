# Phase 0 Research: Browser Ping Pong on AKS

**Date**: 2026-05-30
**Feature**: Multiplayer Browser Ping Pong

## Decision: Keep Version 1 Anonymous and Invite-Only

**Decision**: Ship without accounts, public matchmaking, match history, or leaderboards. Online play uses private join codes/links.

**Rationale**: This is the fastest path to a stable, shippable multiplayer game. It avoids identity, moderation, privacy, persistent storage, and matchmaking complexity while still proving the core product promise.

**Alternatives considered**:

- Public matchmaking: deferred because it adds queueing, abuse controls, and skill/session matching.
- User accounts and profiles: deferred because they require authentication, data retention, privacy decisions, and persistence.
- Leaderboards and match history: deferred because they require durable storage and anti-cheat concerns.

## Decision: Use TypeScript Across Frontend, Backend, and Shared Game Core

**Decision**: Use a TypeScript monorepo with `apps/web`, `apps/realtime`, `packages/game-core`, and `packages/contracts`.

**Rationale**: Shared types and deterministic game logic reduce drift between browser and backend. A single language lowers small-team context switching and makes contract tests easier.

**Alternatives considered**:

- Separate frontend TypeScript and backend Go/Rust: stronger backend performance but slower for a small team and duplicates domain types.
- Fully client-side game with backend relay only: simpler backend but weaker fairness and scoring authority for online play.

## Decision: React + Vite + Canvas 2D for the Frontend

**Decision**: Use React for application UI and HUD state, Vite for development/build, and Canvas 2D for the court and gameplay rendering.

**Rationale**: React is effective for menus, controls, and HUD states, while Canvas 2D is simple and performant for Pong-style rendering. Vite provides a fast browser development loop and production build flow for modern web apps.

**Alternatives considered**:

- DOM-only rendering: easier to inspect but less suitable for smooth ball/paddle animation.
- WebGL/Three.js: unnecessary for 2D Pong and adds avoidable complexity.
- Vanilla TypeScript without React: viable, but React simplifies UI states and accessibility around menus/controls.

## Decision: Node.js LTS + Fastify + WebSocket for the Backend

**Decision**: Use Node.js LTS with Fastify for HTTP endpoints and `@fastify/websocket` or `ws` for WebSocket sessions.

**Rationale**: Node.js and TypeScript align with the frontend/shared code. Fastify keeps HTTP routing, validation hooks, and observability simple. The WebSocket layer is enough for low-latency two-player sessions without introducing a heavier realtime framework.

**Alternatives considered**:

- Socket.IO: useful reconnect and room features, but additional protocol behavior and fallback modes are not needed for the MVP.
- Go backend: strong runtime profile, but it splits the codebase and requires duplicate game contracts.
- Managed realtime-only service: useful later for scale, but the backend still needs authoritative game state.

## Decision: Server-Authoritative Online State With Client Interpolation

**Decision**: Online mode runs authoritative match state on the backend at a fixed 30 Hz tick. Clients send inputs, render locally at the browser animation rate, interpolate remote state, and reconcile to snapshots/deltas.

**Rationale**: This prevents clients from awarding points or moving outside bounds while keeping controls responsive. A 30 Hz server tick is a practical balance for Pong, network overhead, and a small backend.

**Alternatives considered**:

- Client-authoritative state: fastest to build but unfair and easier to manipulate.
- Lockstep peer-to-peer: avoids server simulation but is fragile across browser/network differences.
- 60 Hz server tick: smoother but increases CPU/network overhead before evidence shows it is needed.

## Decision: In-Memory Online Sessions for MVP, Redis/Web PubSub Later if Needed

**Decision**: Store active online sessions in backend memory for v1. Run the backend active-session owner as one replica for production v1, while frontend/stateless paths can scale horizontally. Add Azure Cache for Redis or Azure Web PubSub before multi-replica active-session ownership.

**Rationale**: The MVP target is 100 concurrent online matches. A single tuned backend replica should handle that target and is much simpler than distributed match ownership. This choice is explicit so the team does not accidentally deploy an unsafe multi-replica session model.

**Alternatives considered**:

- Redis session directory and pub/sub in v1: enables multi-replica session routing, but adds infrastructure and cross-pod event relay complexity.
- Azure Web PubSub in v1: offloads connection handling, but still requires authoritative game ownership and adds provider-specific workflow.
- Kubernetes sticky sessions only: not sufficient because the second player may enter through a different browser/IP and still needs the same match owner.

## Decision: Kustomize Manifests Before Helm

**Decision**: Use Kubernetes manifests with Kustomize overlays for dev, staging, and prod-style environments.

**Rationale**: Kustomize keeps the deployment transparent for a small team and avoids creating a chart abstraction before configuration needs justify it.

**Alternatives considered**:

- Helm from day one: useful for distribution and complex templating, but unnecessary for two services and a small set of overlays.
- Raw copied YAML per environment: simple at first but prone to drift.

## Decision: Cost-Conscious AKS With ACR, Key Vault, and Azure Monitor

**Decision**: Use AKS for workloads, ACR for images, Key Vault CSI for production secrets, and Azure Monitor/Container Insights for logs and metrics. Use NGINX Ingress for MVP cost control unless WAF or Application Gateway features are required.

**Rationale**: These services satisfy deployment, security, and observability needs without forcing a database or managed realtime service into the first release.

**Alternatives considered**:

- Application Gateway from day one: stronger managed L7/WAF story, but likely higher cost for MVP validation.
- Kubernetes Secrets only: acceptable for local/dev, but Key Vault is safer for production secret lifecycle.
- Database from day one: unnecessary without accounts/history/leaderboards.

## Decision: CI/CD Uses Build Once, Promote Same Images

**Decision**: CI builds and tests once, pushes immutable images to ACR, deploys to dev, promotes the same image tags to staging and production-style environments after gates pass.

**Rationale**: Promoting the same artifact reduces environment drift and makes rollback simpler.

**Alternatives considered**:

- Rebuild per environment: easier to script initially but increases drift risk.
- Manual local deploys: useful during early experiments but not sufficient for release reliability.

## References

- Azure Key Vault provider for Secrets Store CSI Driver for AKS: https://learn.microsoft.com/en-us/azure/aks/csi-secrets-store-driver
- Azure Monitor for Kubernetes clusters: https://learn.microsoft.com/azure/azure-monitor/containers/monitor-kubernetes
- Azure Application Gateway WebSocket ingress example: https://learn.microsoft.com/en-us/azure/application-gateway/ingress-controller-expose-websocket-server
- Azure Container Registry and AKS integration: https://learn.microsoft.com/en-us/azure/aks/tutorial-kubernetes-prepare-acr
- GitHub Actions deployment to AKS: https://learn.microsoft.com/en-us/azure/aks/kubernetes-action
- AKS cost and autoscaling guidance: https://learn.microsoft.com/en-us/azure/aks/optimize-aks-costs
- Vite production build guide: https://vite.dev/guide/build
- Node.js WebSocket overview: https://nodejs.org/uk/learn/getting-started/websocket
