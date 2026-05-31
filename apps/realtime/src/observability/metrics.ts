import { FastifyInstance } from "fastify";
import { ConnectionRegistry } from "../websocket/connection-registry";
import { SessionRepository } from "../sessions/session-repository";
import { InputValidator } from "../websocket/input-validator";
import { OnlineMatchRunner } from "../sessions/online-match-runner";

export class MetricsRegistry {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly connections: ConnectionRegistry,
    private readonly inputValidator: InputValidator,
    private readonly runner: OnlineMatchRunner
  ) {}

  render(): string {
    const activeSessions = this.sessions.countActive();
    const connectedPlayers = this.connections.count();
    return [
      "# HELP pingpong_active_sessions Active online sessions owned by this backend.",
      "# TYPE pingpong_active_sessions gauge",
      `pingpong_active_sessions ${activeSessions}`,
      "# HELP pingpong_connected_players Connected realtime players.",
      "# TYPE pingpong_connected_players gauge",
      `pingpong_connected_players ${connectedPlayers}`,
      "# HELP pingpong_match_tick_duration_ms Last authoritative match tick duration.",
      "# TYPE pingpong_match_tick_duration_ms gauge",
      `pingpong_match_tick_duration_ms ${this.runner.lastTickDurationMs}`,
      "# HELP pingpong_input_rejections_total Rejected realtime input events.",
      "# TYPE pingpong_input_rejections_total counter",
      `pingpong_input_rejections_total ${this.inputValidator.rejectionCount}`,
      "# HELP pingpong_disconnects_total Transient disconnect events detected.",
      "# TYPE pingpong_disconnects_total counter",
      `pingpong_disconnects_total ${this.connections.disconnectCount}`,
      "# HELP pingpong_reconnects_total Successful reconnect events detected.",
      "# TYPE pingpong_reconnects_total counter",
      `pingpong_reconnects_total ${this.connections.reconnectCount}`
    ].join("\n");
  }
}

export const registerMetricsRoute = (app: FastifyInstance, metrics: MetricsRegistry) => {
  app.get("/metrics", async (_request, reply) => {
    await reply.header("content-type", "text/plain; version=0.0.4").send(metrics.render());
  });
};
