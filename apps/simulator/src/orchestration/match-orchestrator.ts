import { SimulationConfiguration } from "@pingpong/contracts";
import { SimulatorConfig } from "../config/env";
import { SimulationMetrics } from "../metrics/simulation-metrics";
import { logWarn } from "../observability/logger";
import { RealtimeClient } from "../virtual-player/realtime-client";
import { SessionApiClient } from "../virtual-player/session-api-client";
import { VirtualPlayerWorker } from "../virtual-player/virtual-player-worker";
import { WebSocketClientPool } from "../virtual-player/websocket-client-pool";
import { ConcurrencyLimiter } from "./concurrency-limiter";

export interface MatchOrchestrationHandle {
  stop: () => Promise<void>;
  activeVirtualPlayers: () => number;
  activeSimulatedMatches: () => number;
}

export class MatchOrchestrator {
  private readonly sessions: SessionApiClient;

  constructor(
    private readonly config: SimulatorConfig,
    private readonly metrics: SimulationMetrics,
    private readonly pool: WebSocketClientPool
  ) {
    this.sessions = new SessionApiClient(config.targetApiUrl);
  }

  async start(
    runId: string,
    configuration: SimulationConfiguration
  ): Promise<MatchOrchestrationHandle> {
    const limiter = new ConcurrencyLimiter(25);
    const workers: VirtualPlayerWorker[] = [];
    let activeMatches = 0;
    let stopped = false;

    const startMatch = async (matchIndex: number) => {
      if (stopped || workers.length >= configuration.virtualPlayers) return;
      const created = await this.sessions.createSession();
      activeMatches += 1;
      const leftClient = new RealtimeClient(
        {
          websocketUrl: this.config.targetRealtimeUrl || created.websocketUrl,
          sessionId: created.sessionId,
          playerId: created.playerId,
          playerToken: created.playerToken
        },
        this.metrics
      );
      this.pool.add(leftClient);
      const leftWorker = new VirtualPlayerWorker({
        virtualPlayerId: `${runId}-p${matchIndex}-left`,
        side: "left",
        credentials: {
          websocketUrl: this.config.targetRealtimeUrl || created.websocketUrl,
          sessionId: created.sessionId,
          playerId: created.playerId,
          playerToken: created.playerToken
        },
        behaviorProfile: configuration.behaviorProfile,
        updateFrequencyHz: configuration.updateFrequencyHz,
        disconnectRatePerMinute: configuration.disconnectRatePerMinute,
        reconnectRatePerMinute: configuration.reconnectRatePerMinute,
        seed: configuration.seed,
        client: leftClient
      });
      workers.push(leftWorker);

      if (workers.length < configuration.virtualPlayers) {
        const joined = await this.sessions.joinSession(created.sessionId, created.joinCode);
        const rightClient = new RealtimeClient(
          {
            websocketUrl: this.config.targetRealtimeUrl || joined.websocketUrl,
            sessionId: joined.sessionId,
            playerId: joined.playerId,
            playerToken: joined.playerToken
          },
          this.metrics
        );
        this.pool.add(rightClient);
        workers.push(
          new VirtualPlayerWorker({
            virtualPlayerId: `${runId}-p${matchIndex}-right`,
            side: "right",
            credentials: {
              websocketUrl: this.config.targetRealtimeUrl || joined.websocketUrl,
              sessionId: joined.sessionId,
              playerId: joined.playerId,
              playerToken: joined.playerToken
            },
            behaviorProfile: configuration.behaviorProfile,
            updateFrequencyHz: configuration.updateFrequencyHz,
            disconnectRatePerMinute: configuration.disconnectRatePerMinute,
            reconnectRatePerMinute: configuration.reconnectRatePerMinute,
            seed: configuration.seed,
            client: rightClient
          })
        );
      }
    };

    await Promise.all(
      Array.from({ length: configuration.matches }, (_, index) =>
        limiter.run(() => startMatch(index))
      )
    );
    this.metrics.setActiveSimulatedMatches(activeMatches);
    this.metrics.setActiveVirtualPlayers(workers.length);

    await Promise.allSettled(
      workers.map((worker) =>
        worker.start().catch((error) => {
          logWarn("virtual player failed to start", {
            runId,
            virtualPlayerId: worker.id,
            error: error instanceof Error ? error.message : error
          });
        })
      )
    );

    return {
      stop: async () => {
        stopped = true;
        for (const worker of workers) {
          worker.stop();
        }
        this.pool.closeAll();
        this.metrics.setActiveVirtualPlayers(0);
        this.metrics.setActiveSimulatedMatches(0);
      },
      activeVirtualPlayers: () => workers.filter((worker) => worker.state === "playing").length,
      activeSimulatedMatches: () => (stopped ? 0 : activeMatches)
    };
  }
}
