import { FastifyInstance } from "fastify";
import { HealthResponse } from "@pingpong/contracts";

export interface HealthState {
  ready: boolean;
  version: string;
}

export const registerHealthRoutes = (app: FastifyInstance, state: HealthState) => {
  app.get(
    "/api/health/live",
    async (): Promise<HealthResponse> => ({
      status: "ok",
      serviceTime: new Date().toISOString(),
      version: state.version
    })
  );

  app.get("/api/health/ready", async (request, reply): Promise<HealthResponse | void> => {
    if (!state.ready) {
      await reply.code(503).send({
        code: "NOT_READY",
        message: "Service is starting or draining.",
        retryable: true
      });
      return;
    }

    return {
      status: "ok",
      serviceTime: new Date().toISOString(),
      version: state.version
    };
  });
};
