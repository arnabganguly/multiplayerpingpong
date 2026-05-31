import { describe, expect, it } from "vitest";
import { buildServer } from "../src/server";
import { loadEnv } from "../src/config/env";

const config = loadEnv({
  SESSION_TOKEN_SIGNING_SECRET: "secret-for-tests",
  ALLOWED_ORIGINS: "http://localhost:5173"
});

describe("session HTTP routes", () => {
  it("creates, inspects, and joins a session", async () => {
    const app = buildServer({ config, startLoops: false });
    const created = await app.inject({
      method: "POST",
      url: "/api/sessions",
      payload: { targetScore: 11, winBy: 2, clientProtocolVersion: "1.0" }
    });
    expect(created.statusCode).toBe(201);
    const body = created.json();
    expect(body.playerToken).toBeTruthy();

    const metadata = await app.inject({ method: "GET", url: `/api/sessions/${body.sessionId}` });
    expect(metadata.statusCode).toBe(200);
    expect(metadata.json().playerCount).toBe(1);

    const joined = await app.inject({
      method: "POST",
      url: `/api/sessions/${body.sessionId}/join`,
      payload: { joinCode: body.joinCode, clientProtocolVersion: "1.0" }
    });
    expect(joined.statusCode).toBe(200);
    expect(joined.json().side).toBe("right");
    await app.close();
  });
});
