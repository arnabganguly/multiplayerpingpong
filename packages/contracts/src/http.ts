import { isMatchStatus, isPlayerSide, MatchStatus, PlayerSide, PROTOCOL_VERSION } from "./domain";

export interface HealthResponse {
  status: "ok";
  serviceTime: string;
  version?: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  retryable: boolean;
  correlationId?: string;
}

export interface CreateSessionRequest {
  targetScore?: number;
  winBy?: number;
  clientProtocolVersion?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  joinCode: string;
  joinUrl: string;
  playerId: string;
  side: PlayerSide;
  playerToken: string;
  websocketUrl: string;
  expiresAt: string;
}

export interface JoinSessionRequest {
  joinCode: string;
  clientProtocolVersion: string;
}

export interface SessionMetadataResponse {
  sessionId: string;
  status: MatchStatus;
  mode: "online_two_player";
  playerCount: number;
  capacity: 2;
  expiresAt: string;
}

export interface JoinSessionResponse {
  sessionId: string;
  playerId: string;
  side: PlayerSide;
  playerToken: string;
  websocketUrl: string;
  sessionState: SessionMetadataResponse;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  error?: ErrorResponse;
}

const objectRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const invalid = <T>(message: string): ValidationResult<T> => ({
  ok: false,
  error: { code: "INVALID_REQUEST", message, retryable: false }
});

const valid = <T>(value: T): ValidationResult<T> => ({ ok: true, value });

export const validateCreateSessionRequest = (
  body: unknown
): ValidationResult<CreateSessionRequest> => {
  if (body === undefined || body === null) {
    return valid({ clientProtocolVersion: PROTOCOL_VERSION });
  }

  const record = objectRecord(body);
  if (!record) {
    return invalid("Request body must be an object.");
  }

  const targetScore = record.targetScore ?? 11;
  const winBy = record.winBy ?? 2;
  const clientProtocolVersion = record.clientProtocolVersion ?? PROTOCOL_VERSION;

  if (!Number.isInteger(targetScore) || Number(targetScore) < 1 || Number(targetScore) > 99) {
    return invalid("targetScore must be an integer between 1 and 99.");
  }

  if (!Number.isInteger(winBy) || Number(winBy) < 1 || Number(winBy) > 10) {
    return invalid("winBy must be an integer between 1 and 10.");
  }

  if (clientProtocolVersion !== PROTOCOL_VERSION) {
    return invalid("Unsupported client protocol version.");
  }

  return valid({
    targetScore: Number(targetScore),
    winBy: Number(winBy),
    clientProtocolVersion: PROTOCOL_VERSION
  });
};

export const validateJoinSessionRequest = (body: unknown): ValidationResult<JoinSessionRequest> => {
  const record = objectRecord(body);
  if (!record) {
    return invalid("Request body must be an object.");
  }

  if (typeof record.joinCode !== "string" || record.joinCode.trim().length < 4) {
    return invalid("joinCode is required.");
  }

  if (record.clientProtocolVersion !== PROTOCOL_VERSION) {
    return invalid("Unsupported client protocol version.");
  }

  return valid({
    joinCode: record.joinCode.trim().toUpperCase(),
    clientProtocolVersion: PROTOCOL_VERSION
  });
};

export const assertSessionMetadataResponse = (value: unknown): value is SessionMetadataResponse => {
  const record = objectRecord(value);
  return Boolean(
    record &&
    typeof record.sessionId === "string" &&
    isMatchStatus(record.status) &&
    record.mode === "online_two_player" &&
    Number.isInteger(record.playerCount) &&
    record.capacity === 2 &&
    typeof record.expiresAt === "string"
  );
};

export const assertCreateSessionResponse = (value: unknown): value is CreateSessionResponse => {
  const record = objectRecord(value);
  return Boolean(
    record &&
    typeof record.sessionId === "string" &&
    typeof record.joinCode === "string" &&
    typeof record.joinUrl === "string" &&
    typeof record.playerId === "string" &&
    isPlayerSide(record.side) &&
    typeof record.playerToken === "string" &&
    typeof record.websocketUrl === "string" &&
    typeof record.expiresAt === "string"
  );
};
