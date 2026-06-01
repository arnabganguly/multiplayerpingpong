import { FastifyInstance } from "fastify";
import { SimulationMetrics } from "../metrics/simulation-metrics";

export const registerMetricsRoutes = (app: FastifyInstance, metrics: SimulationMetrics) => {
  app.get("/metrics", async (_request, reply) => {
    await reply.header("content-type", "text/plain; version=0.0.4").send(metrics.render());
  });
};
