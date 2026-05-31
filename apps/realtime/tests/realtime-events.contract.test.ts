import { describe, expect, it } from "vitest";
import { validatePaddlePayload, validateRealtimeEnvelope } from "@pingpong/contracts";

describe("realtime event contracts", () => {
  it("rejects out-of-bounds target input", () => {
    expect(validatePaddlePayload({ intent: "target", targetY: 2 }).ok).toBe(false);
  });

  it("accepts required envelope fields", () => {
    const result = validateRealtimeEnvelope({
      type: "session.join",
      protocolVersion: "1.0",
      sessionId: "sess_12345678",
      playerId: "player_left",
      sequence: 1,
      timestamp: new Date().toISOString(),
      payload: { playerToken: "secret-token" }
    });
    expect(result.ok).toBe(true);
  });
});
