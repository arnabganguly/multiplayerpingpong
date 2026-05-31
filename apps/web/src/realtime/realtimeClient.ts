import { PROTOCOL_VERSION, RealtimeEnvelope, serverEvent } from "@pingpong/contracts";

export interface RealtimeCredentials {
  websocketUrl: string;
  sessionId: string;
  playerId: string;
  playerToken: string;
}

export class RealtimeClient {
  private socket: WebSocket | undefined;
  private sequence = 1;

  constructor(
    private readonly credentials: RealtimeCredentials,
    private readonly onMessage: (event: RealtimeEnvelope) => void,
    private readonly onStatus: (status: "connected" | "closed" | "error") => void
  ) {}

  connect() {
    this.socket = new WebSocket(this.credentials.websocketUrl);
    this.socket.addEventListener("open", () => {
      this.onStatus("connected");
      this.send("session.join", {
        playerToken: this.credentials.playerToken,
        lastSeenServerSequence: 0
      });
    });
    this.socket.addEventListener("message", (message) => {
      this.onMessage(JSON.parse(String(message.data)) as RealtimeEnvelope);
    });
    this.socket.addEventListener("close", () => this.onStatus("closed"));
    this.socket.addEventListener("error", () => this.onStatus("error"));
  }

  send(type: string, payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const event = {
      type,
      protocolVersion: PROTOCOL_VERSION,
      sessionId: this.credentials.sessionId,
      playerId: this.credentials.playerId,
      sequence: this.sequence++,
      timestamp: new Date().toISOString(),
      payload
    };
    this.socket.send(JSON.stringify(event));
  }

  paddle(intent: "up" | "down" | "stop" | "target", targetY?: number) {
    this.send("input.paddle", {
      intent,
      targetY,
      playerToken: this.credentials.playerToken
    });
  }

  close() {
    this.socket?.close();
  }
}

export const createLocalSnapshot = () =>
  serverEvent("state.snapshot", "local", 0, {
    status: "waiting",
    score: { left: 0, right: 0 },
    servingSide: "left",
    ball: { x: 0.5, y: 0.5, vx: 0, vy: 0, speed: 0 },
    paddles: { left: { y: 0.41, height: 0.18 }, right: { y: 0.41, height: 0.18 } },
    rallyCount: 0
  });
