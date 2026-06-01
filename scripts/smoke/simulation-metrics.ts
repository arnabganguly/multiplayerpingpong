const simulatorBaseUrl = process.env.SIMULATOR_BASE_URL ?? "http://localhost:8090";
const requiredMetrics = [
  "active_virtual_players",
  "active_simulated_matches",
  "websocket_connections",
  "messages_per_second",
  "simulation_runs_total",
  "simulation_failures_total"
];

const response = await fetch(`${simulatorBaseUrl}/metrics`);
const body = await response.text();

if (!response.ok) {
  throw new Error(`/metrics returned ${response.status}`);
}

for (const metric of requiredMetrics) {
  if (!body.includes(metric)) {
    throw new Error(`Missing simulator metric: ${metric}`);
  }
}

console.log("Simulator metrics smoke check passed.");
