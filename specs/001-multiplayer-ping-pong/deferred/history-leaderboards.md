# Deferred: Match History and Leaderboards

Match history and leaderboards require durable persistence and anti-abuse rules.
They should remain disabled for low-cost anonymous deployments unless a future
product decision makes them part of the release scope.

Dependencies:

- Match result persistence.
- Identity or anonymous integrity model.
- Anti-cheat and replay/dispute policy.
