import { PaddleCommands, advanceLocalMatch, LocalMatch } from "@pingpong/game-core";
import { SessionRepository } from "./session-repository";
import { StateBroadcaster } from "../websocket/state-broadcaster";

export class OnlineMatchRunner {
  private interval: NodeJS.Timeout | undefined;
  private readonly commands = new Map<string, PaddleCommands>();
  lastTickDurationMs = 0;

  constructor(
    private readonly repository: SessionRepository,
    private readonly broadcaster: StateBroadcaster,
    private readonly tickRate: number
  ) {}

  setCommand(sessionId: string, commands: PaddleCommands): void {
    this.commands.set(sessionId, { ...this.commands.get(sessionId), ...commands });
  }

  tick(deltaSeconds = 1 / this.tickRate): void {
    const started = performance.now();
    for (const session of this.repository.all()) {
      if (session.state.status === "waiting" || session.state.status === "match_ended") continue;
      const match: LocalMatch = {
        mode: "online_two_player",
        state: session.state,
        previousActiveStatus: session.previousActiveStatus,
        winCondition: { targetScore: session.targetScore, winBy: session.winBy }
      };
      const next = advanceLocalMatch(match, deltaSeconds, this.commands.get(session.sessionId));
      session.state = next.state;
      session.status = next.state.status;
      session.previousActiveStatus = next.previousActiveStatus;
      this.repository.update(session);
      this.broadcaster.snapshot(session);
    }
    this.lastTickDurationMs = Math.round((performance.now() - started) * 100) / 100;
  }

  start(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.tick(), 1000 / this.tickRate);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
