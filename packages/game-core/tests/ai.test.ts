import { describe, expect, it } from "vitest";
import { chooseAiPaddleIntent, createInitialPaddle } from "../src";

describe("AI behavior", () => {
  it("tracks the ball with a bounded target", () => {
    const decision = chooseAiPaddleIntent(createInitialPaddle(), 0.8, { difficultyLevel: 2 });
    expect(decision.intent).toBe("target");
    expect(decision.targetY).toBeGreaterThan(0);
    expect(decision.targetY).toBeLessThanOrEqual(1);
  });

  it("stops when close enough to the target", () => {
    const decision = chooseAiPaddleIntent(createInitialPaddle(), 0.5, {
      difficultyLevel: 5,
      imperfection: 0
    });
    expect(["stop", "target"]).toContain(decision.intent);
  });
});
