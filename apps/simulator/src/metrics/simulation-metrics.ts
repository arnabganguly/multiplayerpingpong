export class SimulationMetrics {
  private activeVirtualPlayers = 0;
  private activeSimulatedMatches = 0;
  private websocketConnections = 0;
  private sentMessages = 0;
  private receivedMessages = 0;
  private failures = 0;
  private runs = 0;
  private windowStartedAt = Date.now();
  private windowMessages = 0;

  runStarted(): void {
    this.runs += 1;
  }

  runFailed(): void {
    this.failures += 1;
  }

  setActiveVirtualPlayers(value: number): void {
    this.activeVirtualPlayers = Math.max(0, value);
  }

  setActiveSimulatedMatches(value: number): void {
    this.activeSimulatedMatches = Math.max(0, value);
  }

  connectionOpened(): void {
    this.websocketConnections += 1;
  }

  connectionClosed(): void {
    this.websocketConnections = Math.max(0, this.websocketConnections - 1);
  }

  messageSent(): void {
    this.sentMessages += 1;
    this.windowMessages += 1;
  }

  messageReceived(): void {
    this.receivedMessages += 1;
    this.windowMessages += 1;
  }

  snapshot() {
    return {
      active_virtual_players: this.activeVirtualPlayers,
      active_simulated_matches: this.activeSimulatedMatches,
      websocket_connections: this.websocketConnections,
      messages_per_second: this.messagesPerSecond(),
      simulation_runs_total: this.runs,
      simulation_failures_total: this.failures
    };
  }

  messagesPerSecond(): number {
    const elapsedSeconds = Math.max(1, (Date.now() - this.windowStartedAt) / 1000);
    const value = Math.round((this.windowMessages / elapsedSeconds) * 100) / 100;
    if (elapsedSeconds >= 10) {
      this.windowStartedAt = Date.now();
      this.windowMessages = 0;
    }
    return value;
  }

  render(): string {
    const snapshot = this.snapshot();
    return [
      "# HELP active_virtual_players Number of virtual players currently allocated to active simulation runs.",
      "# TYPE active_virtual_players gauge",
      `active_virtual_players ${snapshot.active_virtual_players}`,
      "# HELP active_simulated_matches Number of simulated matches currently active.",
      "# TYPE active_simulated_matches gauge",
      `active_simulated_matches ${snapshot.active_simulated_matches}`,
      "# HELP websocket_connections Number of simulator-owned WebSocket connections currently open.",
      "# TYPE websocket_connections gauge",
      `websocket_connections ${snapshot.websocket_connections}`,
      "# HELP messages_per_second Rolling rate of simulator realtime messages per second.",
      "# TYPE messages_per_second gauge",
      `messages_per_second ${snapshot.messages_per_second}`,
      "# HELP simulation_runs_total Total number of simulation runs requested.",
      "# TYPE simulation_runs_total counter",
      `simulation_runs_total ${snapshot.simulation_runs_total}`,
      "# HELP simulation_failures_total Total number of simulation failures.",
      "# TYPE simulation_failures_total counter",
      `simulation_failures_total ${snapshot.simulation_failures_total}`
    ].join("\n");
  }
}
