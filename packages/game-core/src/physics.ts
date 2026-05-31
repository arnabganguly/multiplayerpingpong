import { BallState, PaddleIntent, PaddleState } from "./entities";
import { clamp, COURT_HEIGHT, COURT_WIDTH, PADDLE_SPEED } from "./constants";

export const moveBall = (ball: BallState, deltaSeconds: number): BallState => ({
  ...ball,
  x: ball.x + ball.vx * deltaSeconds,
  y: ball.y + ball.vy * deltaSeconds
});

export const clampPaddleY = (y: number, height: number): number =>
  clamp(y, 0, COURT_HEIGHT - height);

export const movePaddle = (
  paddle: PaddleState,
  intent: PaddleIntent,
  deltaSeconds: number,
  targetY?: number
): PaddleState => {
  if (intent === "target" && typeof targetY === "number") {
    const desiredTop = clampPaddleY(targetY - paddle.height / 2, paddle.height);
    const diff = desiredTop - paddle.y;
    const maxMove = PADDLE_SPEED * deltaSeconds;
    const nextY = Math.abs(diff) <= maxMove ? desiredTop : paddle.y + Math.sign(diff) * maxMove;
    return {
      ...paddle,
      y: clampPaddleY(nextY, paddle.height),
      velocity: Math.sign(diff) * PADDLE_SPEED,
      intent
    };
  }

  const direction = intent === "up" ? -1 : intent === "down" ? 1 : 0;
  return {
    ...paddle,
    y: clampPaddleY(paddle.y + direction * PADDLE_SPEED * deltaSeconds, paddle.height),
    velocity: direction * PADDLE_SPEED,
    intent
  };
};

export const keepBallWithinVerticalBounds = (ball: BallState): BallState => {
  if (ball.y - ball.radius < 0) {
    return { ...ball, y: ball.radius, vy: Math.abs(ball.vy) };
  }

  if (ball.y + ball.radius > COURT_HEIGHT) {
    return { ...ball, y: COURT_HEIGHT - ball.radius, vy: -Math.abs(ball.vy) };
  }

  return ball;
};

export const isBeyondLeftBoundary = (ball: BallState): boolean => ball.x + ball.radius < 0;
export const isBeyondRightBoundary = (ball: BallState): boolean =>
  ball.x - ball.radius > COURT_WIDTH;
