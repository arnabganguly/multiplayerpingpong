const simulatorUrl =
  process.env.SIMULATOR_API_URL ??
  process.env.SIMULATOR_URL ??
  "http://localhost:8090/api/simulator";
const token = process.env.SIMULATION_ADMIN_TOKEN ?? "local-admin-token";

const request = {
  virtualPlayers: 100,
  matches: 50,
  durationSeconds: 60,
  behaviorProfile: "balanced",
  updateFrequencyHz: 10,
  disconnectRatePerMinute: 0,
  reconnectRatePerMinute: 0,
  seed: `smoke-${Date.now()}`
};

const authHeaders = {
  authorization: `Bearer ${token}`
};

const jsonHeaders = {
  "content-type": "application/json",
  authorization: `Bearer ${token}`
};

const parseJson = async (response: Response) => {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
};

const start = await fetch(`${simulatorUrl}/start`, {
  method: "POST",
  headers: jsonHeaders,
  body: JSON.stringify(request)
}).then(parseJson);

console.log(`Started simulation ${start.runId} with ${request.virtualPlayers} players.`);

let status;
for (let attempt = 0; attempt < 30; attempt += 1) {
  status = await fetch(`${simulatorUrl}/status`, { headers: authHeaders }).then(parseJson);
  if (status.activeRun?.activeVirtualPlayers > 0 || status.activeRun?.status === "running") {
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

console.log(JSON.stringify(status?.activeRun ?? status, null, 2));

await fetch(`${simulatorUrl}/stop`, { method: "POST", headers: authHeaders }).then(parseJson);
console.log("100-player simulation smoke check passed.");
