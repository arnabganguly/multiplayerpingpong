export interface SimulatorConfig {
  appEnv: string;
  port: number;
  enabled: boolean;
  adminToken: string;
  targetBaseUrl: string;
  targetApiUrl: string;
  targetRealtimeUrl: string;
  maxVirtualPlayers: number;
  maxDurationSeconds: number;
  maxUpdateFrequencyHz: number;
  startupTimeoutMs: number;
  shutdownGraceMs: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

const numberFromEnv = (
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  min: number
): number => {
  const raw = env[key];
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isFinite(value) || value < min) {
    throw new Error(`${key} must be a number >= ${min}`);
  }
  return value;
};

const boolFromEnv = (env: NodeJS.ProcessEnv, key: string, fallback: boolean): boolean => {
  const raw = env[key];
  if (raw === undefined) return fallback;
  return raw === "true" || raw === "1";
};

const requiredUrl = (env: NodeJS.ProcessEnv, key: string, fallback: string): string => {
  const value = env[key] ?? fallback;
  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL`);
  }
  return value.replace(/\/$/, "");
};

export const loadEnv = (env: NodeJS.ProcessEnv = process.env): SimulatorConfig => {
  const appEnv = env.APP_ENV ?? "local";
  const enabled = boolFromEnv(env, "SIMULATION_ENABLED", appEnv !== "prod");
  const adminToken = env.SIMULATION_ADMIN_TOKEN;
  if (!adminToken) {
    throw new Error("SIMULATION_ADMIN_TOKEN is required");
  }

  const logLevel = env.LOG_LEVEL ?? "info";
  if (logLevel !== "debug" && logLevel !== "info" && logLevel !== "warn" && logLevel !== "error") {
    throw new Error("LOG_LEVEL must be debug, info, warn, or error");
  }

  return {
    appEnv,
    port: numberFromEnv(env, "PORT", 8090, 1),
    enabled,
    adminToken,
    targetBaseUrl: requiredUrl(env, "SIMULATION_TARGET_BASE_URL", "http://localhost:5173"),
    targetApiUrl: requiredUrl(env, "SIMULATION_TARGET_API_URL", "http://localhost:5173/api"),
    targetRealtimeUrl: requiredUrl(env, "SIMULATION_TARGET_REALTIME_URL", "ws://localhost:5173/ws"),
    maxVirtualPlayers: numberFromEnv(env, "SIMULATION_MAX_VIRTUAL_PLAYERS", 1000, 1),
    maxDurationSeconds: numberFromEnv(env, "SIMULATION_MAX_DURATION_SECONDS", 1800, 30),
    maxUpdateFrequencyHz: numberFromEnv(env, "SIMULATION_MAX_UPDATE_FREQUENCY_HZ", 20, 0.1),
    startupTimeoutMs: numberFromEnv(env, "SIMULATION_STARTUP_TIMEOUT_MS", 15_000, 1000),
    shutdownGraceMs: numberFromEnv(env, "SIMULATION_SHUTDOWN_GRACE_MS", 60_000, 1000),
    logLevel
  };
};
