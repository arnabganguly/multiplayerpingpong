import { SeededRandom } from "./seeded-random";

export class DisconnectScheduler {
  constructor(
    private readonly disconnectRatePerMinute: number,
    private readonly reconnectRatePerMinute: number,
    private readonly random: SeededRandom
  ) {}

  shouldDisconnect(intervalMs = 1000): boolean {
    const probability = Math.min(1, (this.disconnectRatePerMinute * intervalMs) / 60_000);
    return this.random.next() < probability;
  }

  shouldReconnect(intervalMs = 1000): boolean {
    const probability = Math.min(1, (this.reconnectRatePerMinute * intervalMs) / 60_000);
    return this.random.next() < probability;
  }
}
