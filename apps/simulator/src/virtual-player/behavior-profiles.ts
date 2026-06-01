import { SimulationBehaviorProfile } from "@pingpong/contracts";

export interface BehaviorProfileDefinition {
  name: SimulationBehaviorProfile;
  reactionDelayMs: number;
  targetingAccuracy: number;
  movementVariance: number;
  mistakeRate: number;
}

export const BEHAVIOR_PROFILES: Record<SimulationBehaviorProfile, BehaviorProfileDefinition> = {
  balanced: {
    name: "balanced",
    reactionDelayMs: 120,
    targetingAccuracy: 0.78,
    movementVariance: 0.08,
    mistakeRate: 0.08
  },
  aggressive: {
    name: "aggressive",
    reactionDelayMs: 70,
    targetingAccuracy: 0.88,
    movementVariance: 0.04,
    mistakeRate: 0.04
  },
  defensive: {
    name: "defensive",
    reactionDelayMs: 180,
    targetingAccuracy: 0.68,
    movementVariance: 0.06,
    mistakeRate: 0.05
  },
  erratic: {
    name: "erratic",
    reactionDelayMs: 90,
    targetingAccuracy: 0.48,
    movementVariance: 0.24,
    mistakeRate: 0.22
  }
};
