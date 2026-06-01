import { PaddleInputPayload, PlayerSide, SnapshotPayload } from "@pingpong/contracts";
import { BehaviorProfileDefinition } from "./behavior-profiles";
import { SeededRandom } from "./seeded-random";

export class BotBehaviorEngine {
  constructor(
    private readonly profile: BehaviorProfileDefinition,
    private readonly random: SeededRandom
  ) {}

  nextInput(side: PlayerSide, snapshot?: SnapshotPayload): PaddleInputPayload {
    if (!snapshot) {
      return { intent: "stop" };
    }

    const paddle = snapshot.paddles[side];
    const center = paddle.y + paddle.height / 2;
    const mistake = this.random.next() < this.profile.mistakeRate;
    const variance = this.random.between(
      -this.profile.movementVariance,
      this.profile.movementVariance
    );
    const target = mistake
      ? 1 - snapshot.ball.y + variance
      : snapshot.ball.y * this.profile.targetingAccuracy +
        center * (1 - this.profile.targetingAccuracy) +
        variance;
    const boundedTarget = Math.max(0, Math.min(1, target));

    if (Math.abs(center - boundedTarget) < 0.03) {
      return { intent: "stop" };
    }

    return { intent: boundedTarget < center ? "up" : "down" };
  }
}
