export interface WebConfig {
  publicBaseUrl: string;
  publicApiUrl: string;
  publicRealtimeUrl: string;
  publicSimulatorApiUrl: string;
}

const fromMeta = (name: string): string | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;

export const getWebConfig = (): WebConfig => {
  const env = import.meta.env;
  const origin = window.location.origin;

  return {
    publicBaseUrl: fromMeta("public-base-url") ?? env.PUBLIC_BASE_URL ?? origin,
    publicApiUrl: fromMeta("public-api-url") ?? env.PUBLIC_API_URL ?? `${origin}/api`,
    publicRealtimeUrl:
      fromMeta("public-realtime-url") ??
      env.PUBLIC_REALTIME_URL ??
      `${origin.replace(/^http/, "ws")}/ws`,
    publicSimulatorApiUrl:
      fromMeta("public-simulator-api-url") ??
      env.PUBLIC_SIMULATOR_API_URL ??
      `${origin}/api/simulator`
  };
};
