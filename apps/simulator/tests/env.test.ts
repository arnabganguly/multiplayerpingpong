import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env";

describe("loadEnv", () => {
  it("loads simulator defaults for local environments", () => {
    const config = loadEnv({ SIMULATION_ADMIN_TOKEN: "token" });
    expect(config.enabled).toBe(true);
    expect(config.port).toBe(8090);
    expect(config.maxVirtualPlayers).toBe(1000);
  });

  it("disables simulation by default in production", () => {
    const config = loadEnv({ APP_ENV: "prod", SIMULATION_ADMIN_TOKEN: "token" });
    expect(config.enabled).toBe(false);
  });

  it("requires an administrator token", () => {
    expect(() => loadEnv({})).toThrow(/SIMULATION_ADMIN_TOKEN/);
  });
});
