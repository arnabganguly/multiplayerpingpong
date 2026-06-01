import {
  assertCreateSessionResponse,
  CreateSessionResponse,
  JoinSessionResponse,
  PROTOCOL_VERSION
} from "@pingpong/contracts";

export class SessionApiClient {
  constructor(private readonly apiUrl: string) {}

  async createSession(): Promise<CreateSessionResponse> {
    const response = await fetch(`${this.apiUrl}/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientProtocolVersion: PROTOCOL_VERSION })
    });
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }
    const body = await response.json();
    if (!assertCreateSessionResponse(body)) {
      throw new Error("Session create response did not match contract.");
    }
    return body;
  }

  async joinSession(sessionId: string, joinCode: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${this.apiUrl}/sessions/${sessionId}/join`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ joinCode, clientProtocolVersion: PROTOCOL_VERSION })
    });
    if (!response.ok) {
      throw new Error(`Failed to join session: ${response.status}`);
    }
    return (await response.json()) as JoinSessionResponse;
  }
}
