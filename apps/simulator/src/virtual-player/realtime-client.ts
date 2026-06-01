import WebSocket from "ws";
import {
  PaddleInputPayload,
  PROTOCOL_VERSION,
  RealtimeEnvelope,
  SessionJoinPayload,
  SnapshotPayload,
  assertSnapshotPayload
} from "@pingpong/contracts";
import { SimulationMetrics } from "../metrics/simulation-metrics";

export interface RealtimeClientCredentials {
  websocketUrl: string;
  sessionId: string;
  playerId: string;
  playerToken: string;
}

export class RealtimeClient {
  private socket: WebSocket | undefined;
  private sequence = 1;
  snapshot: SnapshotPayload | undefined;

  constructor(
    private readonly credentials: RealtimeClientCredentials,
    private readonly metrics: SimulationMetrics
  ) {}

  async connect(): Promise<void> {
    this.socket = new WebSocket(this.credentials.websocketUrl);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket connect timeout")), 10_000);
      this.socket?.once("open", () => {
        clearTimeout(timer);
        this.metrics.connectionOpened();
        this.join();
        resolve();
      });
      this.socket?.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });

    this.socket.on("message", (data) => {
      this.metrics.messageReceived();
      const event = JSON.parse(String(data)) as RealtimeEnvelope;
      if (event.type === "state.snapshot" && assertSnapshotPayload(event.payload)) {
        this.snapshot = event.payload;
      }
    });

    this.socket.on("close", () => this.metrics.connectionClosed());
  }

  sendPaddle(payload: PaddleInputPayload): void {
    this.send("input.paddle", {
      ...payload,
      playerToken: this.credentials.playerToken
    });
  }

  close(): void {
    this.socket?.close();
  }

  private join(): void {
    const payload: SessionJoinPayload = {
      playerToken: this.credentials.playerToken,
      lastSeenServerSequence: 0
    };
    this.send("session.join", payload);
  }

  private send(type: string, payload: unknown): void {
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
    this.metrics.messageSent();
  }
}
