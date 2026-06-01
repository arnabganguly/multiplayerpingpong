import Fastify, { FastifyInstance } from "fastify";
import { loadEnv, SimulatorConfig } from "./config/env";
import { createAdminGuard } from "./http/admin-auth";
import { registerHealthRoutes } from "./http/health-routes";
import { registerMetricsRoutes } from "./http/metrics-routes";
import { registerSimulationRoutes } from "./http/simulation-routes";
import { SimulationMetrics } from "./metrics/simulation-metrics";
import { logError, logInfo } from "./observability/logger";
import { MatchOrchestrator } from "./orchestration/match-orchestrator";
import { SimulationRepository } from "./orchestration/simulation-repository";
import { SimulationService } from "./orchestration/simulation-service";
import { WebSocketClientPool } from "./virtual-player/websocket-client-pool";

export interface ServerOptions {
  config?: SimulatorConfig;
}

type ReadyServer = FastifyInstance & { setReady: (ready: boolean) => void };

export const buildServer = (options: ServerOptions = {}) => {
  const config = options.config ?? loadEnv();
  const app = Fastify({ logger: config.logLevel === "debug" });
  const healthState = { ready: true, version: "0.1.0" };
  const metrics = new SimulationMetrics();
  const repository = new SimulationRepository();
  const pool = new WebSocketClientPool();
  const orchestrator = new MatchOrchestrator(config, metrics, pool);
  const simulations = new SimulationService(config, repository, orchestrator, metrics);
  const adminGuard = createAdminGuard(config);

  registerHealthRoutes(app, healthState);
  registerMetricsRoutes(app, metrics);
  app.addHook("preHandler", async (request, reply) => {
    if (request.url.startsWith("/api/simulator") || request.url.startsWith("/admin/simulations")) {
      return adminGuard(request, reply);
    }
  });
  registerSimulationRoutes(app, simulations, config);

  app.addHook("onClose", async () => {
    healthState.ready = false;
    await simulations.stop();
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
    logInfo("load-generator service started", {
      port: config.port,
      appEnv: config.appEnv,
      enabled: config.enabled
    });
    const shutdown = async (signal: string) => {
      logInfo("load-generator service draining", { signal });
      (app as unknown as ReadyServer).setReady(false);
      await app.close();
    };
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
    process.once("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    logError("load-generator service failed to start", {
      error: error instanceof Error ? error.message : error
    });
    process.exit(1);
  }
}
