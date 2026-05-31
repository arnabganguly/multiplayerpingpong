import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { PlayerSide, PlayerToken } from "@pingpong/contracts";

const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;

export const signPlayerToken = (
  secret: string,
  input: Omit<PlayerToken, "tokenId" | "issuedAt"> & { issuedAt?: string }
): string => {
  const payload: PlayerToken = {
    tokenId: randomUUID(),
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    sessionId: input.sessionId,
    playerId: input.playerId,
    side: input.side,
    expiresAt: input.expiresAt
  };
  const body = encode(payload);
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
};

export const verifyPlayerToken = (
  secret: string,
  token: string,
  expected?: { sessionId?: string; playerId?: string; side?: PlayerSide }
): PlayerToken | undefined => {
  const [body, signature] = token.split(".");
  if (!body || !signature) return undefined;
  const expectedSignature = createHmac("sha256", secret).update(body).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return undefined;
  }

  const payload = decode<PlayerToken>(body);
  if (Date.parse(payload.expiresAt) <= Date.now()) return undefined;
  if (expected?.sessionId && payload.sessionId !== expected.sessionId) return undefined;
  if (expected?.playerId && payload.playerId !== expected.playerId) return undefined;
  if (expected?.side && payload.side !== expected.side) return undefined;
  return payload;
};
