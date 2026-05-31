import { describe, expect, it } from "vitest";
import {
  canTransition,
  pauseLocalMatch,
  resumeLocalMatch,
  restartLocalMatch,
  createLocalMatch
} from "../src";

describe("state transitions", () => {
  it("allows serve, pause, resume, restart, and end transitions", () => {
    expect(canTransition("serving", "in_play")).toBe(true);
    expect(canTransition("in_play", "paused")).toBe(true);
    expect(canTransition("paused", "in_play")).toBe(true);
    expect(canTransition("paused", "restarted")).toBe(true);
    expect(canTransition("point_scored", "match_ended")).toBe(true);
  });

  it("pauses and resumes from the previous active state", () => {
    const match = createLocalMatch();
    const paused = pauseLocalMatch(match);
    const resumed = resumeLocalMatch(paused);
    expect(paused.state.status).toBe("paused");
    expect(resumed.state.status).toBe("serving");
  });

  it("restarts a match to a serving state", () => {
    expect(restartLocalMatch(createLocalMatch()).state.status).toBe("serving");
  });
});
