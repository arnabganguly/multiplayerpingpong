import {
  BallState,
  isMatchStatus,
  isPlayerSide,
  MatchStatus,
  PaddleIntent,
  PlayerSide,
  PROTOCOL_VERSION,
  Score
} from "./domain";
import { ErrorResponse, ValidationResult } from "./http";

export const CLOSE_CODES = {
  NORMAL: 1000,
  POLICY_VIOLATION: 1008,
  SERVER_ERROR: 1011,
  UNSUPPORTED_PROTOCOL: 4001,
  SESSION_EXPIRED: 4002,
  SESSION_FULL: 4003,
  RATE_LIMITED: 4004
} as const;

export type ClientEventType =
  | "session.join"
  | "input.paddle"
  | "match.pause"
  | "match.resume"
  | "match.restart"
  | "session.leave"
  | "heartbeat";

export type ServerEventType =
  | "session.ready"
  | "state.snapshot"
  | "state.delta"
  | "point.scored"
  | "match.paused"
  | "match.resumed"
  | "match.ended"
  | "player.disconnected"
  | "player.reconnected"
  | "error";

export interface RealtimeEnvelope<TType extends string = string, TPayload = unknown> {
  type: TType;
  protocolVersion: typeof PROTOCOL_VERSION;
  sessionId: string;
  playerId?: string;
  sequence: number;
  timestamp: string;
  payload: TPayload;
}

export interface SessionJoinPayload {
  playerToken: string;
  lastSeenServerSequence?: number;
}

export interface PaddleInputPayload {
  intent: PaddleIntent;
  targetY?: number;
}

export interface RestartPayload {
  intent: "request" | "accept";
}

export interface HeartbeatPayload {
  clientNow: number;
}

export interface SnapshotPayload {
  status: MatchStatus;
  score: Score;
  servingSide: PlayerSide;
  ball: Omit<BallState, "radius">;
  paddles: Record<PlayerSide, { y: number; height: number }>;
  rallyCount: number;
}

const objectRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const invalid = <T>(message: string, code = "INVALID_EVENT"): ValidationResult<T> => ({
  ok: false,
  error: { code, message, retryable: code !== "UNAUTHORIZED" }
});

const valid = <T>(value: T): ValidationResult<T> => ({ ok: true, value });

export const isClientEventType = (value: unknown): value is ClientEventType =>
  value === "session.join" ||
  value === "input.paddle" ||
  value === "match.pause" ||
  value === "match.resume" ||
  value === "match.restart" ||
  value === "session.leave" ||
  value === "heartbeat";

export const isServerEventType = (value: unknown): value is ServerEventType =>
  value === "session.ready" ||
  value === "state.snapshot" ||
  value === "state.delta" ||
  value === "point.scored" ||
  value === "match.paused" ||
  value === "match.resumed" ||
  value === "match.ended" ||
  value === "player.disconnected" ||
  value === "player.reconnected" ||
  value === "error";

export const validateRealtimeEnvelope = (
  message: unknown
): ValidationResult<RealtimeEnvelope<ClientEventType>> => {
  const record = objectRecord(message);
  if (!record) {
    return invalid("Message must be an object.");
  }

  if (!isClientEventType(record.type)) {
    return invalid("Unsupported event type.");
  }

  if (record.protocolVersion !== PROTOCOL_VERSION) {
    return invalid("Unsupported protocol version.", "UNSUPPORTED_PROTOCOL");
  }

  if (typeof record.sessionId !== "string" || record.sessionId.length < 8) {
    return invalid("sessionId is required.");
  }

  if (!Number.isInteger(record.sequence) || Number(record.sequence) < 0) {
    return invalid("sequence must be a non-negative integer.");
  }

  if (typeof record.timestamp !== "string") {
    return invalid("timestamp is required.");
  }

  return valid(record as unknown as RealtimeEnvelope<ClientEventType>);
};

export const validatePaddlePayload = (payload: unknown): ValidationResult<PaddleInputPayload> => {
  const record = objectRecord(payload);
  if (!record) {
    return invalid("Paddle payload must be an object.");
  }

  const intent = record.intent;
  if (intent !== "up" && intent !== "down" && intent !== "stop" && intent !== "target") {
    return invalid("Paddle intent is invalid.");
  }

  if (intent === "target") {
    if (typeof record.targetY !== "number" || record.targetY < 0 || record.targetY > 1) {
      return invalid("targetY must be between 0 and 1.");
    }
  }

  return valid({
    intent,
    targetY: typeof record.targetY === "number" ? record.targetY : undefined
  });
};

export const serverEvent = <TType extends ServerEventType, TPayload>(
  type: TType,
  sessionId: string,
  sequence: number,
  payload: TPayload
): RealtimeEnvelope<TType, TPayload> => ({
  type,
  protocolVersion: PROTOCOL_VERSION,
  sessionId,
  sequence,
  timestamp: new Date().toISOString(),
  payload
});

export const errorEvent = (
  sessionId: string,
  sequence: number,
  error: ErrorResponse
): RealtimeEnvelope<"error", ErrorResponse> => serverEvent("error", sessionId, sequence, error);

export const assertSnapshotPayload = (value: unknown): value is SnapshotPayload => {
  const record = objectRecord(value);
  const score = objectRecord(record?.score);
  const ball = objectRecord(record?.ball);
  const paddles = objectRecord(record?.paddles);
  const left = objectRecord(paddles?.left);
  const right = objectRecord(paddles?.right);

  return Boolean(
    record &&
    isMatchStatus(record.status) &&
    score &&
    Number.isFinite(score.left) &&
    Number.isFinite(score.right) &&
    isPlayerSide(record.servingSide) &&
    ball &&
    Number.isFinite(ball.x) &&
    Number.isFinite(ball.y) &&
    Number.isFinite(ball.vx) &&
    Number.isFinite(ball.vy) &&
    Number.isFinite(ball.speed) &&
    left &&
    right &&
    Number.isFinite(left.y) &&
    Number.isFinite(right.y) &&
    Number.isInteger(record.rallyCount)
  );
};
