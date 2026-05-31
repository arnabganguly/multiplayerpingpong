import { createInitialGameState } from "../src/entities";

export const baselineState = () => createInitialGameState();

export const stateWithScore = (left: number, right: number) =>
  createInitialGameState({
    score: { left, right }
  });
