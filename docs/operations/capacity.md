# Capacity Model

Baseline target: 100 concurrent online matches in one Azure region.

Version 1 stores active online sessions in backend memory. The frontend may use
multiple replicas, but the realtime backend is capped at one active-session
owner in the included HPA. New backend replicas can safely serve stateless
health paths only after session ownership is externalized.

Before raising realtime `maxReplicas` above `1`, add one of:

- Azure Cache for Redis for session directory and pub/sub.
- Azure Web PubSub for connection fanout with backend-owned simulation.
- Another explicit owner-routing layer that maps a session to its backend pod.

Capacity validation must record:

- Active sessions and connected players.
- p95 online update visibility below 150 ms in-region.
- Tick duration and CPU/memory under load.
- Disconnect/reconnect success rate.
