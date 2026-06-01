import { describe, expect, it } from "vitest";
import { buildServer } from "../src/server";
import { testSimulatorConfig } from "./fixtures/simulation-fixtures";

describe("administrator authorization", () => {
  it("rejects simulator routes without the admin token", async () => {
    const app = buildServer({ config: testSimulatorConfig() });
    const response = await app.inject({ method: "GET", url: "/api/simulator/status" });
    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe("UNAUTHORIZED");
    await app.close();
  });

  it("accepts bearer tokens on simulator routes", async () => {
    const app = buildServer({ config: testSimulatorConfig() });
    const response = await app.inject({
      method: "GET",
      url: "/api/simulator/status",
      headers: { authorization: "Bearer test-admin-token" }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().enabled).toBe(true);
    await app.close();
  });
});
