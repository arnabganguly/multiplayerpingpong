import { randomBytes, randomUUID } from "node:crypto";
import {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  Player,
  PlayerSide,
  SessionMetadataResponse
} from "@pingpong/contracts";
import { RealtimeConfig } from "../config/env";
import { signPlayerToken, verifyPlayerToken } from "./player-token";
import {
  createOnlineState,
  OnlineSessionRecord,
  playerForSide,
  SessionRepository
} from "./session-repository";

const createId = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
const createJoinCode = () => randomBytes(4).toString("base64url").slice(0, 6).toUpperCase();

export class SessionService {
  constructor(
    private readonly config: RealtimeConfig,
    private readonly repository: SessionRepository
  ) {}

  createSession(request: CreateSessionRequest = {}): CreateSessionResponse | undefined {
    if (this.repository.countActive() >= this.config.maxSessionsPerBackend) {
      return undefined;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.sessionTtlSeconds * 1000).toISOString();
    const sessionId = createId("sess");
    const playerId = "player_left";
    const side: PlayerSide = "left";
    const state = createOnlineState();
    const player: Player = {
      playerId,
      displayName: "Player 1",
      side,
      kind: "human",
      controlType: "remote",
      connectionState: "connected",
      score: 0,
      lastInputSequence: 0,
      lastSeenAt: now.toISOString()
    };

    const session: OnlineSessionRecord = {
      sessionId,
      joinCode: createJoinCode(),
      status: "waiting",
      players: [player],
      createdAt: now.toISOString(),
      expiresAt,
      targetScore: request.targetScore ?? this.config.defaultTargetScore,
      winBy: request.winBy ?? 2,
      ownerInstanceId: process.env.HOSTNAME ?? "local",
      state,
      previousActiveStatus: "waiting",
      restartRequests: new Set()
    };
    this.repository.create(session);

    return {
      sessionId,
      joinCode: session.joinCode,
      joinUrl: `${this.config.publicBaseUrl}/?join=${session.joinCode}&session=${sessionId}`,
      playerId,
      side,
      playerToken: signPlayerToken(this.config.sessionTokenSigningSecret, {
        sessionId,
        playerId,
        side,
        expiresAt
      }),
      websocketUrl: this.config.publicRealtimeUrl,
      expiresAt
    };
  }

  joinSession(sessionId: string, request: JoinSessionRequest): JoinSessionResponse | undefined {
    const session = this.repository.get(sessionId);
    if (!session || session.joinCode !== request.joinCode) return undefined;
    if (playerForSide(session.players, "right")) return undefined;

    const playerId = "player_right";
    const side: PlayerSide = "right";
    const now = new Date().toISOString();
    const player: Player = {
      playerId,
      displayName: "Player 2",
      side,
      kind: "human",
      controlType: "remote",
      connectionState: "connected",
      score: 0,
      lastInputSequence: 0,
      lastSeenAt: now
    };
    session.players.push(player);
    session.status = "serving";
    session.state = { ...session.state, status: "serving", serverTime: now };
    this.repository.update(session);

    return {
      sessionId,
      playerId,
      side,
      playerToken: signPlayerToken(this.config.sessionTokenSigningSecret, {
        sessionId,
        playerId,
        side,
        expiresAt: session.expiresAt
      }),
      websocketUrl: this.config.publicRealtimeUrl,
      sessionState: this.metadata(session)
    };
  }

  getMetadata(sessionId: string): SessionMetadataResponse | undefined {
    const session = this.repository.get(sessionId);
    return session ? this.metadata(session) : undefined;
  }

  authenticate(
    sessionId: string,
    playerId: string,
    token: string
  ): OnlineSessionRecord | undefined {
    const session = this.repository.get(sessionId);
    const player = session?.players.find((candidate) => candidate.playerId === playerId);
    if (!session || !player) return undefined;
    const verified = verifyPlayerToken(this.config.sessionTokenSigningSecret, token, {
      sessionId,
      playerId,
      side: player.side
    });
    if (!verified) return undefined;
    player.connectionState = "connected";
    player.lastSeenAt = new Date().toISOString();
    this.repository.update(session);
    return session;
  }

  markDisconnected(sessionId: string, playerId: string): OnlineSessionRecord | undefined {
    const session = this.repository.get(sessionId);
    const player = session?.players.find((candidate) => candidate.playerId === playerId);
    if (!session || !player || session.status === "match_ended") return undefined;
    player.connectionState = "reconnecting";
    session.previousActiveStatus = session.state.status;
    session.status = "reconnecting";
    session.state = { ...session.state, status: "reconnecting" };
    session.reconnectDeadline = new Date(
      Date.now() + this.config.reconnectGraceSeconds * 1000
    ).toISOString();
    this.repository.update(session);
    return session;
  }

  expireReconnects(now = Date.now()): OnlineSessionRecord[] {
    const changed: OnlineSessionRecord[] = [];
    for (const session of this.repository.all()) {
      if (
        session.status === "reconnecting" &&
        session.reconnectDeadline &&
        Date.parse(session.reconnectDeadline) <= now
      ) {
        const disconnected = session.players.find(
          (player) => player.connectionState === "reconnecting"
        );
        const winnerSide = disconnected?.side === "left" ? "right" : "left";
        session.status = "match_ended";
        session.state = {
          ...session.state,
          status: "match_ended",
          lastPoint: disconnected
            ? { scoringSide: winnerSide, reason: "forfeit" }
            : session.state.lastPoint
        };
        changed.push(this.repository.update(session));
      }
    }
    return changed;
  }

  metadata(session: OnlineSessionRecord): SessionMetadataResponse {
    return {
      sessionId: session.sessionId,
      status: session.state.status,
      mode: "online_two_player",
      playerCount: session.players.length,
      capacity: 2,
      expiresAt: session.expiresAt
    };
  }
}
