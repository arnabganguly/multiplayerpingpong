import { PlayerSide, SimulationBehaviorProfile } from "@pingpong/contracts";
import { BEHAVIOR_PROFILES } from "./behavior-profiles";
import { BotBehaviorEngine } from "./bot-behavior-engine";
import { DisconnectScheduler } from "./disconnect-scheduler";
import { RealtimeClient, RealtimeClientCredentials } from "./realtime-client";
import { SeededRandom } from "./seeded-random";

export type VirtualPlayerState =
  | "allocated"
  | "connecting"
  | "playing"
  | "disconnecting"
  | "stopped"
  | "failed";

export interface VirtualPlayerWorkerOptions {
  virtualPlayerId: string;
  side: PlayerSide;
  credentials: RealtimeClientCredentials;
  behaviorProfile: SimulationBehaviorProfile;
  updateFrequencyHz: number;
  disconnectRatePerMinute: number;
  reconnectRatePerMinute: number;
  seed?: string;
  client: RealtimeClient;
}

export class VirtualPlayerWorker {
  private interval: NodeJS.Timeout | undefined;
  private readonly behavior: BotBehaviorEngine;
  private readonly disconnectScheduler: DisconnectScheduler;
  private reconnecting = false;
  state: VirtualPlayerState = "allocated";
  failureReason: string | undefined;

  constructor(private readonly options: VirtualPlayerWorkerOptions) {
    const random = new SeededRandom(`${options.seed ?? "run"}:${options.virtualPlayerId}`);
    this.behavior = new BotBehaviorEngine(BEHAVIOR_PROFILES[options.behaviorProfile], random);
    this.disconnectScheduler = new DisconnectScheduler(
      options.disconnectRatePerMinute,
      options.reconnectRatePerMinute,
      random
    );
  }

  get id(): string {
    return this.options.virtualPlayerId;
  }

  async start(): Promise<void> {
    try {
      this.state = "connecting";
      await this.options.client.connect();
      this.state = "playing";
      const intervalMs = Math.max(50, Math.round(1000 / this.options.updateFrequencyHz));
      this.interval = setInterval(() => {
        if (this.state === "disconnecting") {
          if (this.disconnectScheduler.shouldReconnect(intervalMs)) {
            void this.reconnectForSimulation();
          }
          return;
        }

        if (this.state !== "playing") return;

        if (this.disconnectScheduler.shouldDisconnect(intervalMs)) {
          this.disconnectForSimulation();
          return;
        }

        const input = this.behavior.nextInput(this.options.side, this.options.client.snapshot);
        this.options.client.sendPaddle(input);
      }, intervalMs);
    } catch (error) {
      this.state = "failed";
      this.failureReason = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.state = "stopped";
    this.options.client.close();
  }

  disconnectForSimulation(): void {
    if (this.state !== "playing") return;
    this.state = "disconnecting";
    this.options.client.close();
  }

  private async reconnectForSimulation(): Promise<void> {
    if (this.reconnecting || this.state !== "disconnecting") return;
    this.reconnecting = true;
    try {
      this.state = "connecting";
      await this.options.client.connect();
      this.state = "playing";
    } catch (error) {
      this.state = "failed";
      this.failureReason = error instanceof Error ? error.message : String(error);
    } finally {
      this.reconnecting = false;
    }
  }
}
