import { describe, expect, it, vi } from "vitest";
import { WebSocketClientPool } from "../src/virtual-player/websocket-client-pool";
import type { RealtimeClient } from "../src/virtual-player/realtime-client";

describe("WebSocketClientPool", () => {
  it("tracks and closes simulator-owned clients", () => {
    const pool = new WebSocketClientPool();
    const client = { close: vi.fn() } as unknown as RealtimeClient;

    pool.add(client);
    expect(pool.count()).toBe(1);
    pool.closeAll();

    expect(client.close).toHaveBeenCalledTimes(1);
    expect(pool.count()).toBe(0);
  });
});
