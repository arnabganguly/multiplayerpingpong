export interface RealtimeConfig {
  appEnv: string;
  port: number;
  publicBaseUrl: string;
  publicRealtimeUrl: string;
  allowedOrigins: string[];
  sessionTtlSeconds: number;
  reconnectGraceSeconds: number;
  defaultTargetScore: number;
  maxBallSpeed: number;
  onlineTickRate: number;
  maxSessionsPerBackend: number;
  logLevel: "debug" | "info" | "warn" | "error";
  metricsEnabled: boolean;
  sessionTokenSigningSecret: string;
  otelExporterOtlpEndpoint?: string;
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

export const loadEnv = (env: NodeJS.ProcessEnv = process.env): RealtimeConfig => {
  const sessionTokenSigningSecret = env.SESSION_TOKEN_SIGNING_SECRET;
  if (!sessionTokenSigningSecret) {
    throw new Error("SESSION_TOKEN_SIGNING_SECRET is required");
  }

  const logLevel = env.LOG_LEVEL ?? "info";
  if (logLevel !== "debug" && logLevel !== "info" && logLevel !== "warn" && logLevel !== "error") {
    throw new Error("LOG_LEVEL must be debug, info, warn, or error");
  }

  return {
    appEnv: env.APP_ENV ?? "local",
    port: numberFromEnv(env, "PORT", 8080, 1),
    publicBaseUrl: env.PUBLIC_BASE_URL ?? "http://localhost:5173",
    publicRealtimeUrl: env.PUBLIC_REALTIME_URL ?? "ws://localhost:8080/ws",
    allowedOrigins: (env.ALLOWED_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    sessionTtlSeconds: numberFromEnv(env, "SESSION_TTL_SECONDS", 900, 30),
    reconnectGraceSeconds: numberFromEnv(env, "RECONNECT_GRACE_SECONDS", 30, 5),
    defaultTargetScore: numberFromEnv(env, "DEFAULT_TARGET_SCORE", 11, 1),
    maxBallSpeed: numberFromEnv(env, "MAX_BALL_SPEED", 2, 0.1),
    onlineTickRate: numberFromEnv(env, "ONLINE_TICK_RATE", 30, 1),
    maxSessionsPerBackend: numberFromEnv(env, "MAX_SESSIONS_PER_BACKEND", 100, 1),
    logLevel,
    metricsEnabled: (env.METRICS_ENABLED ?? "true") !== "false",
    sessionTokenSigningSecret,
    otelExporterOtlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT
  };
};
