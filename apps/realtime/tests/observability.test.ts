import { describe, expect, it } from "vitest";
import { createLogEvent, redactSecrets } from "../src/observability/logger";

describe("observability safety", () => {
  it("redacts tokens and secrets from log fields", () => {
    expect(redactSecrets({ playerToken: "secret-token-value" })).toEqual({
      playerToken: "[REDACTED]"
    });
  });

  it("keeps correlation identifiers in structured events", () => {
    const event = createLogEvent("info", "validation failed", { correlationId: "corr_123" });
    expect(event.correlationId).toBe("corr_123");
    expect(event.message).toBe("validation failed");
  });
});
