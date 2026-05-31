import { RealtimeEnvelope } from "@pingpong/contracts";

export interface RealtimeSocket {
  send: (message: string) => void;
  close: (code?: number, reason?: string) => void;
}

export class ConnectionRegistry {
  private readonly sockets = new Map<string, RealtimeSocket>();
  disconnectCount = 0;
  reconnectCount = 0;

  attach(sessionId: string, playerId: string, socket: RealtimeSocket): void {
    if (!this.sockets.has(this.key(sessionId, playerId))) {
      this.reconnectCount += 1;
    }
    this.sockets.set(this.key(sessionId, playerId), socket);
  }

  detach(sessionId: string, playerId: string): void {
    if (this.sockets.delete(this.key(sessionId, playerId))) {
      this.disconnectCount += 1;
    }
  }

  send(sessionId: string, playerId: string, event: RealtimeEnvelope): void {
    this.sockets.get(this.key(sessionId, playerId))?.send(JSON.stringify(event));
  }

  broadcast(sessionId: string, players: string[], event: RealtimeEnvelope): void {
    for (const playerId of players) {
      this.send(sessionId, playerId, event);
    }
  }

  connectedPlayers(sessionId: string): string[] {
    const prefix = `${sessionId}:`;
    return [...this.sockets.keys()]
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length));
  }

  count(): number {
    return this.sockets.size;
  }

  private key(sessionId: string, playerId: string): string {
    return `${sessionId}:${playerId}`;
  }
}
