import { describe, expect, it } from "vitest";
import { AddressInfo } from "node:net";
import { loadEnv as loadRealtimeEnv } from "../../realtime/src/config/env";
import { buildServer as buildRealtimeServer } from "../../realtime/src/server";
import { SimulationMetrics } from "../src/metrics/simulation-metrics";
import { RealtimeClient } from "../src/virtual-player/realtime-client";
import { SessionApiClient } from "../src/virtual-player/session-api-client";

describe("virtual player realtime integration", () => {
  it("uses the public session API and WebSocket path", async () => {
    const realtime = buildRealtimeServer({
      config: loadRealtimeEnv({
        SESSION_TOKEN_SIGNING_SECRET: "integration-secret",
        ALLOWED_ORIGINS: "http://127.0.0.1:5173",
        PUBLIC_REALTIME_URL: "ws://127.0.0.1:0/ws"
      })
    });
    await realtime.listen({ host: "127.0.0.1", port: 0 });
    const address = realtime.server.address() as AddressInfo;
    const apiUrl = `http://127.0.0.1:${address.port}/api`;
    const websocketUrl = `ws://127.0.0.1:${address.port}/ws`;

    const sessions = new SessionApiClient(apiUrl);
    const created = await sessions.createSession();
    const metrics = new SimulationMetrics();
    const client = new RealtimeClient(
      {
        websocketUrl,
        sessionId: created.sessionId,
        playerId: created.playerId,
        playerToken: created.playerToken
      },
      metrics
    );

    await client.connect();
    client.sendPaddle({ intent: "up" });

    expect(metrics.snapshot().websocket_connections).toBe(1);

    client.close();
    await realtime.close();
  }, 15_000);
});
