import { randomUUID } from "node:crypto";
import {
  SimulationRunSummary,
  SimulationStartRequest,
  SimulatorStatusResponse
} from "@pingpong/contracts";
import { SimulatorConfig } from "../config/env";
import { SimulationMetrics } from "../metrics/simulation-metrics";
import { logError, logInfo } from "../observability/logger";
import { MatchOrchestrator } from "./match-orchestrator";
import { transitionRun } from "./run-state-machine";
import { toRunSummary } from "./run-summary";
import { SimulationRepository } from "./simulation-repository";

export class SimulationService {
  constructor(
    private readonly config: SimulatorConfig,
    private readonly repository: SimulationRepository,
    private readonly orchestrator: MatchOrchestrator,
    private readonly metrics: SimulationMetrics
  ) {}

  start(request: SimulationStartRequest): SimulationRunSummary | undefined {
    if (this.repository.active()) {
      return undefined;
    }

    const now = new Date();
    const run = this.repository.create({
      runId: `sim_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      status: "starting",
      configuration: request,
      createdAt: now.toISOString(),
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + request.durationSeconds * 1000).toISOString()
    });
    this.metrics.runStarted();
    logInfo("simulation run requested", {
      runId: run.runId,
      virtualPlayers: request.virtualPlayers
    });

    void this.orchestrator
      .start(run.runId, request)
      .then(async (handle) => {
        run.handle = handle;
        if (run.status === "stopping" || run.status === "completed") {
          await handle.stop();
          run.status = "completed";
          run.stoppedAt = run.stoppedAt ?? new Date().toISOString();
          this.repository.update(run);
          return;
        }
        run.status = transitionRun(run.status, "running");
        this.repository.update(run);
        logInfo("simulation run started", { runId: run.runId });
        setTimeout(() => void this.stop(run.runId), request.durationSeconds * 1000);
      })
      .catch((error) => {
        run.status = "failed";
        run.lastError = error instanceof Error ? error.message : String(error);
        run.stoppedAt = new Date().toISOString();
        this.metrics.runFailed();
        this.metrics.setActiveVirtualPlayers(0);
        this.metrics.setActiveSimulatedMatches(0);
        this.repository.update(run);
        logError("simulation run failed", { runId: run.runId, error: run.lastError });
      });

    return toRunSummary(run, this.metrics);
  }

  async stop(runId?: string): Promise<SimulationRunSummary | undefined> {
    const run = runId ? this.repository.get(runId) : this.repository.active();
    if (!run) return undefined;
    if (run.status === "completed" || run.status === "failed") {
      return toRunSummary(run, this.metrics);
    }

    if (run.status !== "stopping") {
      run.status = transitionRun(run.status, "stopping");
      this.repository.update(run);
    }

    await run.handle?.stop();
    run.status = run.status === "completed" ? "completed" : transitionRun(run.status, "completed");
    run.stoppedAt = new Date().toISOString();
    this.repository.update(run);
    logInfo("simulation run stopped", { runId: run.runId });
    return toRunSummary(run, this.metrics);
  }

  get(runId: string): SimulationRunSummary | undefined {
    const run = this.repository.get(runId);
    return run ? toRunSummary(run, this.metrics) : undefined;
  }

  list(): SimulationRunSummary[] {
    return this.repository.recent().map((run) => toRunSummary(run, this.metrics));
  }

  status(): SimulatorStatusResponse {
    const activeRun = this.repository.active();
    return {
      enabled: this.config.enabled,
      environment: this.config.appEnv,
      activeRun: activeRun ? toRunSummary(activeRun, this.metrics) : null,
      recentRuns: this.list(),
      limits: {
        maxVirtualPlayers: this.config.maxVirtualPlayers,
        maxDurationSeconds: this.config.maxDurationSeconds,
        maxUpdateFrequencyHz: this.config.maxUpdateFrequencyHz
      }
    };
  }
}
