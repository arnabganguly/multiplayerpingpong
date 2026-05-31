export const PROTOCOL_VERSION = "1.0" as const;

export type PlayerSide = "left" | "right";
export type PlayerKind = "human" | "ai";
export type ControlType = "keyboard" | "touch" | "ai" | "remote";
export type ConnectionState = "not_applicable" | "connected" | "disconnected" | "reconnecting";
export type MatchMode = "single_player_ai" | "local_two_player" | "online_two_player";
export type MatchStatus =
  | "waiting"
  | "serving"
  | "in_play"
  | "paused"
  | "point_scored"
  | "reconnecting"
  | "match_ended"
  | "restarted";

export interface Score {
  left: number;
  right: number;
}

export interface Player {
  playerId: string;
  displayName: string;
  side: PlayerSide;
  kind: PlayerKind;
  controlType: ControlType;
  connectionState: ConnectionState;
  score: number;
  lastInputSequence?: number;
  lastSeenAt?: string;
}

export interface PlayerToken {
  tokenId: string;
  sessionId: string;
  playerId: string;
  side: PlayerSide;
  issuedAt: string;
  expiresAt: string;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}

export interface PaddleState {
  y: number;
  height: number;
  width: number;
  velocity: number;
  intent: PaddleIntent;
}

export type PaddleIntent = "up" | "down" | "stop" | "target";

export interface GameState {
  sequence: number;
  serverTime: string;
  status: MatchStatus;
  ball: BallState;
  paddles: Record<PlayerSide, PaddleState>;
  score: Score;
  servingSide: PlayerSide;
  rallyCount: number;
  difficultyLevel: number;
  lastPoint?: {
    scoringSide: PlayerSide;
    reason: "left_boundary" | "right_boundary" | "forfeit" | "restart";
  };
}

export interface GameSession {
  sessionId: string;
  mode: MatchMode;
  joinCode?: string;
  status: MatchStatus;
  players: Player[];
  createdAt: string;
  expiresAt: string;
  reconnectDeadline?: string;
  targetScore: number;
  winBy: number;
  ownerInstanceId?: string;
  state: GameState;
}

export interface InputEvent<TPayload = unknown> {
  type: string;
  protocolVersion: typeof PROTOCOL_VERSION;
  sessionId: string;
  playerId: string;
  playerToken?: string;
  sequence: number;
  timestamp: string;
  payload: TPayload;
}

export interface MatchResult {
  sessionId: string;
  mode: MatchMode;
  winnerSide: PlayerSide;
  finalScore: Score;
  reason: "target_score" | "forfeit" | "restart" | "server_shutdown";
  durationMs: number;
  completedAt: string;
}

export const isPlayerSide = (value: unknown): value is PlayerSide =>
  value === "left" || value === "right";

export const isMatchStatus = (value: unknown): value is MatchStatus =>
  value === "waiting" ||
  value === "serving" ||
  value === "in_play" ||
  value === "paused" ||
  value === "point_scored" ||
  value === "reconnecting" ||
  value === "match_ended" ||
  value === "restarted";

export const nowIso = (): string => new Date().toISOString();
