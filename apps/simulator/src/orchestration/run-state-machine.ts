import { SimulationStatus } from "@pingpong/contracts";

const transitions: Record<SimulationStatus, SimulationStatus[]> = {
  requested: ["starting", "failed"],
  starting: ["running", "stopping", "failed"],
  running: ["stopping", "completed", "failed"],
  stopping: ["completed", "failed"],
  completed: [],
  failed: []
};

export const canTransitionRun = (from: SimulationStatus, to: SimulationStatus): boolean =>
  transitions[from].includes(to);

export const transitionRun = (from: SimulationStatus, to: SimulationStatus): SimulationStatus => {
  if (!canTransitionRun(from, to)) {
    throw new Error(`Invalid simulation run transition from ${from} to ${to}`);
  }
  return to;
};
