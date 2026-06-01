import { describe, expect, it } from "vitest";
import { assertSimulatorStatusResponse } from "@pingpong/contracts";
import { buildServer } from "../src/server";
import { simulationRequest, testSimulatorConfig } from "./fixtures/simulation-fixtures";

const adminHeaders = { authorization: "Bearer test-admin-token" };

describe("simulator admin routes", () => {
  it("returns simulator status", async () => {
    const app = buildServer({ config: testSimulatorConfig() });
    const response = await app.inject({
      method: "GET",
      url: "/api/simulator/status",
      headers: adminHeaders
    });
    expect(response.statusCode).toBe(200);
    expect(assertSimulatorStatusResponse(response.json())).toBe(true);
    await app.close();
  });

  it("rejects invalid start payloads", async () => {
    const app = buildServer({ config: testSimulatorConfig() });
    const response = await app.inject({
      method: "POST",
      url: "/api/simulator/start",
      headers: adminHeaders,
      payload: simulationRequest({ virtualPlayers: 0 })
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("INVALID_SIMULATION_REQUEST");
    await app.close();
  });

  it("rejects start when the simulator is disabled", async () => {
    const app = buildServer({ config: testSimulatorConfig({ enabled: false }) });
    const response = await app.inject({
      method: "POST",
      url: "/api/simulator/start",
      headers: adminHeaders,
      payload: simulationRequest()
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("SIMULATION_DISABLED");
    await app.close();
  });
});
