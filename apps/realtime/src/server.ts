import Fastify, { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import {
  CLOSE_CODES,
  errorEvent,
  serverEvent,
  validatePaddlePayload,
  validateRealtimeEnvelope
} from "@pingpong/contracts";
import { loadEnv, RealtimeConfig } from "./config/env";
import { registerHealthRoutes } from "./http/health-routes";
import { registerSessionRoutes } from "./http/session-routes";
import { logError, logInfo } from "./observability/logger";
import { SessionRepository } from "./sessions/session-repository";
import { SessionService } from "./sessions/session-service";
import { ConnectionRegistry } from "./websocket/connection-registry";
import { InputValidator } from "./websocket/input-validator";
import { StateBroadcaster } from "./websocket/state-broadcaster";
import { OnlineMatchRunner } from "./sessions/online-match-runner";
import { ReconnectService } from "./sessions/reconnect-service";
import { MetricsRegistry, registerMetricsRoute } from "./observability/metrics";
import { RealtimeSocket } from "./websocket/connection-registry";

export interface ServerOptions {
  config?: RealtimeConfig;
  startLoops?: boolean;
}

type WebSocketConnection = RealtimeSocket & {
  on(event: "message", handler: (raw: Buffer) => void): void;
  on(event: "close", handler: () => void): void;
};

type ReadyServer = FastifyInstance & { setReady: (ready: boolean) => void };

export const buildServer = (options: ServerOptions = {}) => {
  const config = options.config ?? loadEnv();
  const app = Fastify({
    logger: config.logLevel === "debug"
  });
  const healthState = {
    ready: true,
    version: "0.1.0"
  };
  const repository = new SessionRepository();
  const sessions = new SessionService(config, repository);
  const registry = new ConnectionRegistry();
  const broadcaster = new StateBroadcaster(registry);
  const inputValidator = new InputValidator(config);
  const runner = new OnlineMatchRunner(repository, broadcaster, config.onlineTickRate);
  const reconnects = new ReconnectService(sessions, broadcaster);
  const metrics = new MetricsRegistry(repository, registry, inputValidator, runner);

  app.decorate("config", config);
  registerHealthRoutes(app, healthState);
  registerSessionRoutes(app, sessions);
  registerMetricsRoute(app, metrics);
  app.register(websocket);

  app.get("/ws", { websocket: true }, (socket: WebSocketConnection) => {
    let attached: { sessionId: string; playerId: string } | undefined;

    socket.on("message", (raw: Buffer) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString("utf8"));
      } catch {
        socket.send(
          JSON.stringify(
            errorEvent("unknown", 0, {
              code: "INVALID_JSON",
              message: "Message must be JSON.",
              retryable: true
            })
          )
        );
        return;
      }

      const envelope = validateRealtimeEnvelope(parsed);
      if (!envelope.ok || !envelope.value) {
        socket.close(CLOSE_CODES.POLICY_VIOLATION, envelope.error?.message);
        return;
      }
      const event = envelope.value;
      const session = repository.get(event.sessionId);
      if (!session) {
        socket.close(CLOSE_CODES.SESSION_EXPIRED, "Session not found.");
        return;
      }

      if (event.type === "session.join") {
        const token = (event.payload as { playerToken?: string }).playerToken;
        if (
          !event.playerId ||
          !token ||
          !sessions.authenticate(event.sessionId, event.playerId, token)
        ) {
          socket.close(CLOSE_CODES.POLICY_VIOLATION, "Invalid token.");
          return;
        }
        attached = { sessionId: event.sessionId, playerId: event.playerId };
        registry.attach(event.sessionId, event.playerId, socket);
        socket.send(
          JSON.stringify(
            serverEvent("session.ready", event.sessionId, session.state.sequence, {
              playerId: event.playerId,
              side: session.players.find((player) => player.playerId === event.playerId)?.side,
              status: session.state.status,
              serverTime: new Date().toISOString()
            })
          )
        );
        broadcaster.snapshot(session);
        return;
      }

      const validation = inputValidator.validate(parsed, session);
      if ("code" in validation) {
        socket.send(
          JSON.stringify(errorEvent(session.sessionId, session.state.sequence, validation))
        );
        return;
      }

      if (event.type === "input.paddle") {
        const player = session.players.find((candidate) => candidate.playerId === event.playerId);
        const paddle = validatePaddlePayload(event.payload);
        if (player && paddle.ok && paddle.value) {
          runner.setCommand(session.sessionId, {
            [player.side]: paddle.value
          });
        }
      }
    });

    socket.on("close", () => {
      if (attached) {
        registry.detach(attached.sessionId, attached.playerId);
        reconnects.disconnect(attached.sessionId, attached.playerId);
      }
    });
  });

  if (options.startLoops !== false) {
    runner.start();
  }
  const reconnectSweep = setInterval(() => reconnects.sweep(), 1000);
  app.addHook("onClose", async () => {
    healthState.ready = false;
    runner.stop();
    clearInterval(reconnectSweep);
  });
  app.decorate("setReady", (ready: boolean) => {
    healthState.ready = ready;
  });

  return app;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const config = loadEnv();
    const app = buildServer({ config });
    await app.listen({ host: "0.0.0.0", port: config.port });
    logInfo("realtime service started", { port: config.port, appEnv: config.appEnv });
    const shutdown = async (signal: string) => {
      logInfo("realtime service draining", { signal });
      (app as unknown as ReadyServer).setReady(false);
      setTimeout(() => {
        app.close().catch((error) => logError("error during shutdown", { error: error.message }));
      }, 5000);
    };
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
    process.once("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    logError("realtime service failed to start", {
      error: error instanceof Error ? error.message : error
    });
    process.exit(1);
  }
}
