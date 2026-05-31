import { describe, expect, it } from "vitest";
import {
  assertCreateSessionResponse,
  CLOSE_CODES,
  PROTOCOL_VERSION,
  serverEvent,
  validateCreateSessionRequest,
  validateJoinSessionRequest,
  validatePaddlePayload,
  validateRealtimeEnvelope
} from "../src";

describe("HTTP contract schemas", () => {
  it("accepts default session creation payloads", () => {
    expect(validateCreateSessionRequest(undefined)).toEqual({
      ok: true,
      value: { clientProtocolVersion: PROTOCOL_VERSION }
    });
  });

  it("rejects invalid target scores", () => {
    const result = validateCreateSessionRequest({ targetScore: 0, clientProtocolVersion: "1.0" });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_REQUEST");
  });

  it("normalizes valid join codes", () => {
    const result = validateJoinSessionRequest({ joinCode: " abcd ", clientProtocolVersion: "1.0" });
    expect(result.ok).toBe(true);
    expect(result.value?.joinCode).toBe("ABCD");
  });

  it("checks create session response shape without exposing token details", () => {
    expect(
      assertCreateSessionResponse({
        sessionId: "sess_12345678",
        joinCode: "ABCD",
        joinUrl: "https://example.test/join/ABCD",
        playerId: "player_left",
        side: "left",
        playerToken: "secret",
        websocketUrl: "wss://example.test/ws",
        expiresAt: new Date().toISOString()
      })
    ).toBe(true);
  });
});

describe("Realtime event schemas", () => {
  it("validates supported client envelopes", () => {
    const result = validateRealtimeEnvelope({
      type: "input.paddle",
      protocolVersion: "1.0",
      sessionId: "sess_12345678",
      playerId: "player_left",
      sequence: 1,
      timestamp: new Date().toISOString(),
      payload: { intent: "up" }
    });

    expect(result.ok).toBe(true);
  });

  it("rejects unsupported protocol versions", () => {
    const result = validateRealtimeEnvelope({
      type: "heartbeat",
      protocolVersion: "0.9",
      sessionId: "sess_12345678",
      playerId: "player_left",
      sequence: 1,
      timestamp: new Date().toISOString(),
      payload: { clientNow: 1 }
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("UNSUPPORTED_PROTOCOL");
    expect(CLOSE_CODES.UNSUPPORTED_PROTOCOL).toBe(4001);
  });

  it("validates target paddle input bounds", () => {
    expect(validatePaddlePayload({ intent: "target", targetY: 0.5 }).ok).toBe(true);
    expect(validatePaddlePayload({ intent: "target", targetY: 1.5 }).ok).toBe(false);
  });

  it("builds versioned server envelopes", () => {
    const event = serverEvent("session.ready", "sess_12345678", 1, {
      playerId: "player_left",
      side: "left",
      status: "waiting",
      serverTime: new Date().toISOString()
    });

    expect(event.protocolVersion).toBe(PROTOCOL_VERSION);
    expect(event.type).toBe("session.ready");
  });
});
