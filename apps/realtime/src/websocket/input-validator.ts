import {
  ErrorResponse,
  RealtimeEnvelope,
  validatePaddlePayload,
  validateRealtimeEnvelope
} from "@pingpong/contracts";
import { verifyPlayerToken } from "../sessions/player-token";
import { OnlineSessionRecord } from "../sessions/session-repository";
import { RealtimeConfig } from "../config/env";

export interface ValidatedInput {
  event: RealtimeEnvelope;
}

const RATE_WINDOW_MS = 1000;
const MAX_EVENTS_PER_WINDOW = 45;

export class InputValidator {
  private readonly eventTimes = new Map<string, number[]>();
  rejectionCount = 0;

  constructor(private readonly config: RealtimeConfig) {}

  validate(raw: unknown, session: OnlineSessionRecord): ValidatedInput | ErrorResponse {
    const envelope = validateRealtimeEnvelope(raw);
    if (!envelope.ok || !envelope.value) {
      return this.reject(
        envelope.error ?? { code: "INVALID_EVENT", message: "Invalid event.", retryable: true }
      );
    }

    const event = envelope.value;
    const player = session.players.find((candidate) => candidate.playerId === event.playerId);
    const token =
      typeof (event.payload as { playerToken?: unknown }).playerToken === "string"
        ? String((event.payload as { playerToken?: string }).playerToken)
        : undefined;
    if (!player || !token) {
      return this.reject({
        code: "UNAUTHORIZED",
        message: "Player token is required.",
        retryable: false
      });
    }

    const verified = verifyPlayerToken(this.config.sessionTokenSigningSecret, token, {
      sessionId: session.sessionId,
      playerId: player.playerId,
      side: player.side
    });
    if (!verified) {
      return this.reject({
        code: "UNAUTHORIZED",
        message: "Player token is invalid.",
        retryable: false
      });
    }

    if (event.sequence <= (player.lastInputSequence ?? 0)) {
      return this.reject({
        code: "STALE_INPUT",
        message: "Input sequence is stale.",
        retryable: true
      });
    }

    const rateKey = `${session.sessionId}:${player.playerId}`;
    const now = Date.now();
    const recent = (this.eventTimes.get(rateKey) ?? []).filter(
      (time) => now - time < RATE_WINDOW_MS
    );
    if (recent.length >= MAX_EVENTS_PER_WINDOW) {
      return this.reject({
        code: "RATE_LIMITED",
        message: "Too many input events.",
        retryable: true
      });
    }
    recent.push(now);
    this.eventTimes.set(rateKey, recent);

    if (event.type === "input.paddle") {
      const paddle = validatePaddlePayload(event.payload);
      if (!paddle.ok) {
        return this.reject(
          paddle.error ?? {
            code: "INVALID_INPUT",
            message: "Invalid paddle input.",
            retryable: true
          }
        );
      }
    }

    player.lastInputSequence = event.sequence;
    player.lastSeenAt = new Date().toISOString();
    return { event };
  }

  private reject(error: ErrorResponse): ErrorResponse {
    this.rejectionCount += 1;
    return error;
  }
}
