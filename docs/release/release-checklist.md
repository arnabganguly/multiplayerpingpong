# Release Checklist

- [x] AC-001 Single-player match starts, pauses/resumes, restarts, and exposes winner state.
- [x] AC-002 Online session create/join contracts and browser lobby are implemented.
- [x] AC-003 Local two-player match starts with separate controls.
- [x] AC-004 Desktop keyboard and mobile touch controls have automated browser coverage.
- [x] AC-005 Collision and scoring unit tests cover walls, paddles, boundaries, and win-by-two.
- [x] AC-006 Reconnect grace behavior is implemented and covered by lifecycle tests.
- [x] AC-007 Invalid join codes and malformed realtime input are rejected by tests/scripts.
- [x] AC-008 Frontend/backend Dockerfiles and AKS manifests are present.
- [x] AC-009 Health, structured logs, and metrics endpoints are present.
- [ ] AC-010 100 concurrent online match target is validated against AKS.

Release blocker before production-style approval: run Docker build, Kustomize
validation, AKS smoke, and load tests in an environment with Docker, kubectl,
and Azure credentials.
