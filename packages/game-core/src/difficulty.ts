import { BallState } from "./entities";
import { clamp, DEFAULT_BALL_SPEED, MAX_BALL_SPEED } from "./constants";

export const speedForRally = (
  rallyCount: number,
  maxSpeed = MAX_BALL_SPEED,
  baseSpeed = DEFAULT_BALL_SPEED
): number => clamp(baseSpeed * (1 + Math.floor(rallyCount / 3) * 0.08), baseSpeed, maxSpeed);

export const withRallySpeed = (
  ball: BallState,
  rallyCount: number,
  maxSpeed = MAX_BALL_SPEED
): BallState => {
  const nextSpeed = speedForRally(rallyCount, maxSpeed);
  const magnitude = Math.hypot(ball.vx, ball.vy) || DEFAULT_BALL_SPEED;
  const scale = nextSpeed / magnitude;
  return {
    ...ball,
    vx: ball.vx * scale,
    vy: ball.vy * scale,
    speed: nextSpeed
  };
};
