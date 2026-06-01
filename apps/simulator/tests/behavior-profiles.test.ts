import { describe, expect, it } from "vitest";
import { BEHAVIOR_PROFILES } from "../src/virtual-player/behavior-profiles";
import { BotBehaviorEngine } from "../src/virtual-player/bot-behavior-engine";
import { SeededRandom } from "../src/virtual-player/seeded-random";

describe("bot behavior profiles", () => {
  it("defines every supported profile", () => {
    expect(Object.keys(BEHAVIOR_PROFILES).sort()).toEqual([
      "aggressive",
      "balanced",
      "defensive",
      "erratic"
    ]);
  });

  it("returns a neutral input until snapshots arrive", () => {
    const engine = new BotBehaviorEngine(BEHAVIOR_PROFILES.balanced, new SeededRandom("seed"));
    expect(engine.nextInput("left")).toEqual({ intent: "stop" });
  });
});
