import { ErrorResponse, ValidationResult } from "./http";
import {
  isSimulationBehaviorProfile,
  SimulationStartRequest,
  SimulatorStatusResponse,
  SimulationRunSummary
} from "./simulation";

const objectRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const invalid = <T>(message: string): ValidationResult<T> => ({
  ok: false,
  error: { code: "INVALID_SIMULATION_REQUEST", message, retryable: false }
});

const valid = <T>(value: T): ValidationResult<T> => ({ ok: true, value });

const numberField = (
  record: Record<string, unknown>,
  key: string,
  { min, max, integer = false }: { min: number; max?: number; integer?: boolean }
): number | ErrorResponse => {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return {
      code: "INVALID_SIMULATION_REQUEST",
      message: `${key} must be a number.`,
      retryable: false
    };
  }
  if (integer && !Number.isInteger(value)) {
    return {
      code: "INVALID_SIMULATION_REQUEST",
      message: `${key} must be an integer.`,
      retryable: false
    };
  }
  if (value < min || (max !== undefined && value > max)) {
    return {
      code: "INVALID_SIMULATION_REQUEST",
      message: `${key} must be between ${min} and ${max ?? "the configured maximum"}.`,
      retryable: false
    };
  }
  return value;
};

export const validateSimulationStartRequest = (
  body: unknown,
  limits: {
    maxVirtualPlayers: number;
    maxDurationSeconds: number;
    maxUpdateFrequencyHz: number;
  } = {
    maxVirtualPlayers: 1000,
    maxDurationSeconds: 1800,
    maxUpdateFrequencyHz: 20
  }
): ValidationResult<SimulationStartRequest> => {
  const record = objectRecord(body);
  if (!record) return invalid("Request body must be an object.");

  const virtualPlayers = numberField(record, "virtualPlayers", {
    min: 1,
    max: limits.maxVirtualPlayers,
    integer: true
  });
  if (typeof virtualPlayers !== "number") return { ok: false, error: virtualPlayers };

  const matches = numberField(record, "matches", {
    min: 1,
    max: Math.ceil(virtualPlayers / 2),
    integer: true
  });
  if (typeof matches !== "number") return { ok: false, error: matches };

  const durationSeconds = numberField(record, "durationSeconds", {
    min: 30,
    max: limits.maxDurationSeconds,
    integer: true
  });
  if (typeof durationSeconds !== "number") return { ok: false, error: durationSeconds };

  if (!isSimulationBehaviorProfile(record.behaviorProfile)) {
    return invalid("behaviorProfile must be balanced, aggressive, defensive, or erratic.");
  }

  const updateFrequencyHz = numberField(record, "updateFrequencyHz", {
    min: 0.1,
    max: limits.maxUpdateFrequencyHz
  });
  if (typeof updateFrequencyHz !== "number") return { ok: false, error: updateFrequencyHz };

  const disconnectRatePerMinute = numberField(record, "disconnectRatePerMinute", {
    min: 0,
    max: 100
  });
  if (typeof disconnectRatePerMinute !== "number") {
    return { ok: false, error: disconnectRatePerMinute };
  }

  const reconnectRatePerMinute = numberField(record, "reconnectRatePerMinute", {
    min: 0,
    max: 100
  });
  if (typeof reconnectRatePerMinute !== "number") {
    return { ok: false, error: reconnectRatePerMinute };
  }

  return valid({
    virtualPlayers,
    matches,
    durationSeconds,
    behaviorProfile: record.behaviorProfile,
    updateFrequencyHz,
    disconnectRatePerMinute,
    reconnectRatePerMinute,
    seed: typeof record.seed === "string" && record.seed.trim() ? record.seed.trim() : undefined
  });
};

export const assertSimulationRunSummary = (value: unknown): value is SimulationRunSummary => {
  const record = objectRecord(value);
  return Boolean(
    record &&
    typeof record.runId === "string" &&
    typeof record.status === "string" &&
    objectRecord(record.configuration) &&
    Number.isInteger(record.activeVirtualPlayers) &&
    Number.isInteger(record.activeSimulatedMatches) &&
    Number.isInteger(record.websocketConnections) &&
    typeof record.messagesPerSecond === "number" &&
    Number.isInteger(record.failures) &&
    Number.isInteger(record.elapsedSeconds) &&
    Number.isInteger(record.remainingSeconds) &&
    typeof record.createdAt === "string"
  );
};

export const assertSimulatorStatusResponse = (value: unknown): value is SimulatorStatusResponse => {
  const record = objectRecord(value);
  const limits = objectRecord(record?.limits);
  return Boolean(
    record &&
    typeof record.enabled === "boolean" &&
    typeof record.environment === "string" &&
    Array.isArray(record.recentRuns) &&
    limits &&
    Number.isInteger(limits.maxVirtualPlayers) &&
    Number.isInteger(limits.maxDurationSeconds) &&
    typeof limits.maxUpdateFrequencyHz === "number"
  );
};
