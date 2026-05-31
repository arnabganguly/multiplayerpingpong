const TOKEN_PATTERN =
  /([A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}|secret[-_A-Za-z0-9]*)/g;

export interface LogFields {
  [key: string]: unknown;
}

export const redactSecrets = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(TOKEN_PATTERN, "[REDACTED]");
  }

  if (Array.isArray(value)) {
    return value.map(redactSecrets);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key.toLowerCase().includes("token") || key.toLowerCase().includes("secret")
          ? "[REDACTED]"
          : redactSecrets(entry)
      ])
    );
  }

  return value;
};

export const createLogEvent = (level: string, message: string, fields: LogFields = {}) => ({
  ...({
    level,
    message,
    service: "pingpong-realtime",
    time: new Date().toISOString()
  } satisfies LogFields),
  ...(redactSecrets(fields) as LogFields)
});

export const logInfo = (message: string, fields: LogFields = {}) => {
  console.log(JSON.stringify(createLogEvent("info", message, fields)));
};

export const logError = (message: string, fields: LogFields = {}) => {
  console.error(JSON.stringify(createLogEvent("error", message, fields)));
};
