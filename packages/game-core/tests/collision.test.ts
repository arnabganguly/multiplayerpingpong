import { describe, expect, it } from "vitest";
import { createInitialGameState, resolveCollisions } from "../src";

describe("collision rules", () => {
  it("bounces off top wall", () => {
    const result = resolveCollisions(
      createInitialGameState({
        ball: { x: 0.5, y: 0.005, vx: 0.1, vy: -0.4, radius: 0.018, speed: 0.4 }
      })
    );

    expect(result.state.ball.vy).toBeGreaterThan(0);
  });

  it("bounces off paddle face", () => {
    const result = resolveCollisions(
      createInitialGameState({
        ball: { x: 0.07, y: 0.5, vx: -0.4, vy: 0, radius: 0.018, speed: 0.4 }
      })
    );

    expect(result.paddleHit).toBe("left");
    expect(result.state.ball.vx).toBeGreaterThan(0);
  });

  it("scores when the ball crosses a boundary", () => {
    const result = resolveCollisions(
      createInitialGameState({
        ball: { x: -0.04, y: 0.1, vx: -0.4, vy: 0, radius: 0.018, speed: 0.4 }
      })
    );

    expect(result.scoringSide).toBe("right");
  });
});
