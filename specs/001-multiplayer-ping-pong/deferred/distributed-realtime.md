# Deferred: Distributed Realtime Ownership

Version 1 keeps active online sessions in one backend owner because session
state lives in memory. Before raising realtime backend active-session replicas,
externalize owner routing and event fanout.

Options:

- Azure Cache for Redis session directory plus pub/sub.
- Azure Web PubSub for connection fanout with backend-owned simulation.
- Explicit routing service that pins a session to a backend owner.

Acceptance for future work:

- Reconnect works across pod replacement.
- No duplicate authoritative simulation loops for one session.
- Load target can increase beyond the v1 100-match baseline.
