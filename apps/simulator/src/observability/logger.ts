export const logInfo = (message: string, fields: Record<string, unknown> = {}) => {
  console.log(
    JSON.stringify({
      level: "info",
      message,
      service: "load-generator",
      time: new Date().toISOString(),
      ...fields
    })
  );
};

export const logWarn = (message: string, fields: Record<string, unknown> = {}) => {
  console.warn(
    JSON.stringify({
      level: "warn",
      message,
      service: "load-generator",
      time: new Date().toISOString(),
      ...fields
    })
  );
};

export const logError = (message: string, fields: Record<string, unknown> = {}) => {
  console.error(
    JSON.stringify({
      level: "error",
      message,
      service: "load-generator",
      time: new Date().toISOString(),
      ...fields
    })
  );
};
