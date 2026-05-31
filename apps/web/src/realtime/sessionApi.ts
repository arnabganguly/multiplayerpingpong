import {
  CreateSessionResponse,
  JoinSessionResponse,
  PROTOCOL_VERSION,
  SessionMetadataResponse
} from "@pingpong/contracts";

export interface SessionApi {
  createSession: () => Promise<CreateSessionResponse>;
  joinSession: (sessionId: string, joinCode: string) => Promise<JoinSessionResponse>;
  getSession: (sessionId: string) => Promise<SessionMetadataResponse>;
}

export const createSessionApi = (baseUrl: string): SessionApi => {
  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "content-type": "application/json" },
      ...init
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? response.statusText);
    }
    return (await response.json()) as T;
  };

  return {
    createSession: () =>
      request<CreateSessionResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify({ clientProtocolVersion: PROTOCOL_VERSION })
      }),
    joinSession: (sessionId, joinCode) =>
      request<JoinSessionResponse>(`/sessions/${sessionId}/join`, {
        method: "POST",
        body: JSON.stringify({ joinCode, clientProtocolVersion: PROTOCOL_VERSION })
      }),
    getSession: (sessionId) => request<SessionMetadataResponse>(`/sessions/${sessionId}`)
  };
};
