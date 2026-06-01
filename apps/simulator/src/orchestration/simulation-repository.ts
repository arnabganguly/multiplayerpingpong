import { SimulationConfiguration, SimulationStatus } from "@pingpong/contracts";
import { MatchOrchestrationHandle } from "./match-orchestrator";

export interface SimulationRunRecord {
  runId: string;
  status: SimulationStatus;
  configuration: SimulationConfiguration;
  createdAt: string;
  startedAt?: string;
  stoppedAt?: string;
  expiresAt: string;
  lastError?: string;
  handle?: MatchOrchestrationHandle;
}

export class SimulationRepository {
  private readonly runs = new Map<string, SimulationRunRecord>();

  create(record: SimulationRunRecord): SimulationRunRecord {
    this.runs.set(record.runId, record);
    return record;
  }

  update(record: SimulationRunRecord): SimulationRunRecord {
    this.runs.set(record.runId, record);
    return record;
  }

  get(runId: string): SimulationRunRecord | undefined {
    return this.runs.get(runId);
  }

  active(): SimulationRunRecord | undefined {
    return [...this.runs.values()].find((run) =>
      ["requested", "starting", "running", "stopping"].includes(run.status)
    );
  }

  recent(limit = 10): SimulationRunRecord[] {
    return [...this.runs.values()]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  }
}
