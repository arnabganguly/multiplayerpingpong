import { FastifyInstance } from "fastify";
import { validateConfig } from "../orchestration/simulation-config";
import { SimulationService } from "../orchestration/simulation-service";
import { SimulatorConfig } from "../config/env";
import { errorResponse } from "./error-response";

export const registerSimulationRoutes = (
  app: FastifyInstance,
  service: SimulationService,
  config: SimulatorConfig
) => {
  app.get("/api/simulator/status", async () => service.status());

  app.post("/api/simulator/start", async (request, reply) => {
    const validation = validateConfig(request.body, config);
    if (!validation.ok || !validation.value) {
      return reply
        .code(validation.error?.code === "SIMULATION_DISABLED" ? 403 : 400)
        .send(validation.error);
    }

    const summary = service.start(validation.value);
    if (!summary) {
      return reply
        .code(409)
        .send(
          errorResponse("SIMULATION_ALREADY_RUNNING", "A simulation is already active.", false)
        );
    }

    return reply.code(201).send(summary);
  });

  app.post("/api/simulator/stop", async (_request, reply) => {
    const summary = await service.stop();
    if (!summary) {
      return reply
        .code(404)
        .send(errorResponse("SIMULATION_NOT_FOUND", "No active simulation is running.", false));
    }
    return reply.code(202).send(summary);
  });

  app.get("/admin/simulations/status", async () => service.status());
  app.post("/admin/simulations/runs", async (request, reply) => {
    const validation = validateConfig(request.body, config);
    if (!validation.ok || !validation.value) {
      return reply
        .code(validation.error?.code === "SIMULATION_DISABLED" ? 403 : 400)
        .send(validation.error);
    }
    const summary = service.start(validation.value);
    return summary
      ? reply.code(201).send(summary)
      : reply
          .code(409)
          .send(
            errorResponse("SIMULATION_ALREADY_RUNNING", "A simulation is already active.", false)
          );
  });
  app.post("/admin/simulations/runs/:runId/stop", async (request, reply) => {
    const runId = (request.params as { runId: string }).runId;
    const summary = await service.stop(runId);
    return summary
      ? reply.code(202).send(summary)
      : reply
          .code(404)
          .send(errorResponse("SIMULATION_NOT_FOUND", "Simulation run not found.", false));
  });
};
