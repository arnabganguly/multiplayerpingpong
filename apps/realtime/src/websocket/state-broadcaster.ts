import { serverEvent } from "@pingpong/contracts";
import { OnlineSessionRecord } from "../sessions/session-repository";
import { ConnectionRegistry } from "./connection-registry";

export const snapshotPayload = (session: OnlineSessionRecord) => ({
  status: session.state.status,
  score: session.state.score,
  servingSide: session.state.servingSide,
  ball: {
    x: session.state.ball.x,
    y: session.state.ball.y,
    vx: session.state.ball.vx,
    vy: session.state.ball.vy,
    speed: session.state.ball.speed
  },
  paddles: {
    left: { y: session.state.paddles.left.y, height: session.state.paddles.left.height },
    right: { y: session.state.paddles.right.y, height: session.state.paddles.right.height }
  },
  rallyCount: session.state.rallyCount
});

export class StateBroadcaster {
  constructor(private readonly registry: ConnectionRegistry) {}

  snapshot(session: OnlineSessionRecord): void {
    this.registry.broadcast(
      session.sessionId,
      session.players.map((player) => player.playerId),
      serverEvent(
        "state.snapshot",
        session.sessionId,
        session.state.sequence,
        snapshotPayload(session)
      )
    );
  }

  status(session: OnlineSessionRecord, type: "player.disconnected" | "player.reconnected"): void {
    this.registry.broadcast(
      session.sessionId,
      session.players.map((player) => player.playerId),
      serverEvent(type, session.sessionId, session.state.sequence, {
        status: session.state.status,
        reconnectDeadline: session.reconnectDeadline
      })
    );
  }
}
