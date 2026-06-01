import { describe, expect, it } from "vitest";
import { canTransitionRun, transitionRun } from "../src/orchestration/run-state-machine";

describe("simulation run state machine", () => {
  it("allows the expected happy path transitions", () => {
    expect(canTransitionRun("starting", "running")).toBe(true);
    expect(transitionRun("running", "stopping")).toBe("stopping");
    expect(transitionRun("stopping", "completed")).toBe("completed");
  });

  it("rejects terminal transitions back to running", () => {
    expect(() => transitionRun("completed", "running")).toThrow(/Invalid simulation run/);
  });
});
