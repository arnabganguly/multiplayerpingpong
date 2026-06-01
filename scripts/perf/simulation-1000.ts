const simulatorUrl =
  process.env.SIMULATOR_API_URL ??
  process.env.SIMULATOR_URL ??
  "http://localhost:8090/api/simulator";
const token = process.env.SIMULATION_ADMIN_TOKEN ?? "local-admin-token";
const durationSeconds = Number(process.env.SIMULATION_DURATION_SECONDS ?? 300);

const request = {
  virtualPlayers: 1000,
  matches: 500,
  durationSeconds,
  behaviorProfile: process.env.SIMULATION_BEHAVIOR_PROFILE ?? "balanced",
  updateFrequencyHz: Number(process.env.SIMULATION_UPDATE_FREQUENCY_HZ ?? 10),
  disconnectRatePerMinute: Number(process.env.SIMULATION_DISCONNECT_RATE_PER_MINUTE ?? 0),
  reconnectRatePerMinute: Number(process.env.SIMULATION_RECONNECT_RATE_PER_MINUTE ?? 0),
  seed: `cluster-${Date.now()}`
};

const headers = {
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

const started = await fetch(`${simulatorUrl}/start`, {
  method: "POST",
  headers,
  body: JSON.stringify(request)
}).then(parseJson);

console.log(`Started 1,000-player validation run ${started.runId}.`);

for (let attempt = 0; attempt < 60; attempt += 1) {
  const status = await fetch(`${simulatorUrl}/status`, { headers }).then(parseJson);
  console.log(JSON.stringify(status.activeRun ?? status, null, 2));
  if (status.activeRun?.activeVirtualPlayers >= 900) {
    console.log("1,000-player validation reached active load threshold.");
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
