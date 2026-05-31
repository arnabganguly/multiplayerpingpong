import { GameState, Player, PlayerSide } from "@pingpong/contracts";
import { createInitialGameState } from "@pingpong/game-core";

export interface OnlineSessionRecord {
  sessionId: string;
  joinCode: string;
  status: GameState["status"];
  players: Player[];
  createdAt: string;
  expiresAt: string;
  reconnectDeadline?: string;
  targetScore: number;
  winBy: number;
  ownerInstanceId: string;
  state: GameState;
  previousActiveStatus: GameState["status"];
  restartRequests: Set<string>;
}

export class SessionRepository {
  private readonly sessions = new Map<string, OnlineSessionRecord>();

  create(session: OnlineSessionRecord): OnlineSessionRecord {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  get(sessionId: string): OnlineSessionRecord | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    if (Date.parse(session.expiresAt) <= Date.now() && session.status !== "match_ended") {
      this.sessions.delete(sessionId);
      return undefined;
    }
    return session;
  }

  update(session: OnlineSessionRecord): OnlineSessionRecord {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  countActive(): number {
    this.cleanupExpired();
    return this.sessions.size;
  }

  all(): OnlineSessionRecord[] {
    this.cleanupExpired();
    return [...this.sessions.values()];
  }

  cleanupExpired(now = Date.now()): number {
    let removed = 0;
    for (const [sessionId, session] of this.sessions) {
      if (Date.parse(session.expiresAt) <= now && session.status !== "match_ended") {
        this.sessions.delete(sessionId);
        removed += 1;
      }
    }
    return removed;
  }
}

export const createOnlineState = (): GameState => createInitialGameState({ status: "waiting" });

export const playerForSide = (players: Player[], side: PlayerSide): Player | undefined =>
  players.find((player) => player.side === side);
