import { FastifyInstance } from "fastify";
import { validateCreateSessionRequest, validateJoinSessionRequest } from "@pingpong/contracts";
import { SessionService } from "../sessions/session-service";

export const registerSessionRoutes = (app: FastifyInstance, sessions: SessionService) => {
  app.post("/api/sessions", async (request, reply) => {
    const validation = validateCreateSessionRequest(request.body);
    if (!validation.ok) {
      return reply.code(400).send(validation.error);
    }

    const response = sessions.createSession(validation.value);
    if (!response) {
      return reply.code(503).send({
        code: "CAPACITY_UNAVAILABLE",
        message: "No session capacity is currently available.",
        retryable: true
      });
    }

    return reply.code(201).send(response);
  });

  app.get<{ Params: { sessionId: string } }>("/api/sessions/:sessionId", async (request, reply) => {
    const metadata = sessions.getMetadata(request.params.sessionId);
    if (!metadata) {
      return reply.code(404).send({
        code: "SESSION_NOT_FOUND",
        message: "Session was not found or has expired.",
        retryable: false
      });
    }
    return metadata;
  });

  app.post<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/join",
    async (request, reply) => {
      const validation = validateJoinSessionRequest(request.body);
      if (!validation.ok) {
        return reply.code(400).send(validation.error);
      }

      const response = sessions.joinSession(request.params.sessionId, validation.value!);
      if (!response) {
        return reply.code(409).send({
          code: "SESSION_NOT_JOINABLE",
          message: "Session is full, expired, or the join code is invalid.",
          retryable: false
        });
      }
      return response;
    }
  );
};
