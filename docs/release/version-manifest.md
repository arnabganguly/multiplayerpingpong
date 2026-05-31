# Version Manifest

First releasable candidate:

- Source branch: `001-multiplayer-ping-pong`
- Source revision: record with `git rev-parse HEAD` at release time.
- Frontend image: `<acr>.azurecr.io/pingpong-web:<git-sha>`
- Realtime image: `<acr>.azurecr.io/pingpong-realtime:<git-sha>`
- Promotion model: build once on main, push immutable SHA tags, promote same tags
  through dev, staging, and production-style environments.

Do not use mutable `latest` tags for promotion evidence.
