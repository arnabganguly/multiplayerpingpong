import {
  SimulationStartRequest,
  validateSimulationStartRequest,
  ValidationResult
} from "@pingpong/contracts";
import { SimulatorConfig } from "../config/env";

export const validateConfig = (
  body: unknown,
  config: SimulatorConfig
): ValidationResult<SimulationStartRequest> => {
  if (!config.enabled) {
    return {
      ok: false,
      error: {
        code: "SIMULATION_DISABLED",
        message: "Simulation is disabled in this environment.",
        retryable: false
      }
    };
  }

  return validateSimulationStartRequest(body, {
    maxVirtualPlayers: config.maxVirtualPlayers,
    maxDurationSeconds: config.maxDurationSeconds,
    maxUpdateFrequencyHz: config.maxUpdateFrequencyHz
  });
};
