import type {
  ErrorResponse,
  SimulationRunSummary,
  SimulationStartRequest,
  SimulatorStatusResponse
} from "@pingpong/contracts";

export class SimulationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "SimulationApiError";
  }
}

const parseError = async (response: Response): Promise<SimulationApiError> => {
  try {
    const body = (await response.json()) as Partial<ErrorResponse>;
    return new SimulationApiError(
      body.message ?? `Simulator request failed with ${response.status}.`,
      response.status,
      body.code
    );
  } catch {
    return new SimulationApiError(
      `Simulator request failed with ${response.status}.`,
      response.status
    );
  }
};

const requestJson = async <T>(
  baseUrl: string,
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
};

export const getSimulatorStatus = (baseUrl: string, token: string) =>
  requestJson<SimulatorStatusResponse>(baseUrl, "/status", token);

export const startSimulation = (
  baseUrl: string,
  token: string,
  configuration: SimulationStartRequest
) =>
  requestJson<SimulationRunSummary>(baseUrl, "/start", token, {
    method: "POST",
    body: JSON.stringify(configuration)
  });

export const stopSimulation = (baseUrl: string, token: string) =>
  requestJson<SimulationRunSummary>(baseUrl, "/stop", token, { method: "POST" });
