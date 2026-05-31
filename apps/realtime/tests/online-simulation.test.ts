import { describe, expect, it } from "vitest";
import { serverEvent } from "@pingpong/contracts";
import { loadEnv } from "../src/config/env";
import { SessionRepository } from "../src/sessions/session-repository";
import { SessionService } from "../src/sessions/session-service";
import { StateBroadcaster } from "../src/websocket/state-broadcaster";
import { ConnectionRegistry } from "../src/websocket/connection-registry";
import { OnlineMatchRunner } from "../src/sessions/online-match-runner";

describe("authoritative online simulation", () => {
  it("advances serving sessions through the backend runner", () => {
    const config = loadEnv({ SESSION_TOKEN_SIGNING_SECRET: "secret-for-tests" });
    const repo = new SessionRepository();
    const service = new SessionService(config, repo);
    const created = service.createSession()!;
    service.joinSession(created.sessionId, {
      joinCode: created.joinCode,
      clientProtocolVersion: "1.0"
    });
    const registry = new ConnectionRegistry();
    const broadcaster = new StateBroadcaster(registry);
    const runner = new OnlineMatchRunner(repo, broadcaster, 30);
    const before = repo.get(created.sessionId)!.state.sequence;
    runner.tick(1 / 30);
    expect(repo.get(created.sessionId)!.state.sequence).toBeGreaterThan(before);
    expect(serverEvent("state.delta", created.sessionId, 1, {}).type).toBe("state.delta");
  });
});
