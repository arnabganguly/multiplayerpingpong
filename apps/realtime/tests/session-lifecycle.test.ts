import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env";
import { SessionRepository } from "../src/sessions/session-repository";
import { SessionService } from "../src/sessions/session-service";

describe("session lifecycle", () => {
  it("prevents duplicate joins and supports reconnect expiry", () => {
    const config = loadEnv({
      SESSION_TOKEN_SIGNING_SECRET: "secret-for-tests",
      RECONNECT_GRACE_SECONDS: "5"
    });
    const service = new SessionService(config, new SessionRepository());
    const created = service.createSession();
    expect(created).toBeTruthy();
    const joined = service.joinSession(created!.sessionId, {
      joinCode: created!.joinCode,
      clientProtocolVersion: "1.0"
    });
    expect(joined?.side).toBe("right");
    expect(
      service.joinSession(created!.sessionId, {
        joinCode: created!.joinCode,
        clientProtocolVersion: "1.0"
      })
    ).toBeUndefined();

    service.markDisconnected(created!.sessionId, "player_right");
    const expired = service.expireReconnects(Date.now() + 6000);
    expect(expired[0]?.state.status).toBe("match_ended");
  });
});
