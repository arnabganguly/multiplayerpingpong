import { SessionService } from "./session-service";
import { StateBroadcaster } from "../websocket/state-broadcaster";

export class ReconnectService {
  constructor(
    private readonly sessions: SessionService,
    private readonly broadcaster: StateBroadcaster
  ) {}

  disconnect(sessionId: string, playerId: string): void {
    const session = this.sessions.markDisconnected(sessionId, playerId);
    if (session) {
      this.broadcaster.status(session, "player.disconnected");
    }
  }

  sweep(): void {
    for (const session of this.sessions.expireReconnects()) {
      this.broadcaster.snapshot(session);
    }
  }
}
