import { FastifyReply, FastifyRequest } from "fastify";
import { SimulatorConfig } from "../config/env";
import { errorResponse } from "./error-response";

export const createAdminGuard =
  (config: SimulatorConfig) => async (request: FastifyRequest, reply: FastifyReply) => {
    const authorization = request.headers.authorization;
    const headerToken = Array.isArray(request.headers["x-admin-token"])
      ? request.headers["x-admin-token"][0]
      : request.headers["x-admin-token"];
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : undefined;
    const token = bearerToken ?? headerToken;

    if (token !== config.adminToken) {
      return reply
        .code(401)
        .send(errorResponse("UNAUTHORIZED", "Administrator token is required.", false));
    }
  };
