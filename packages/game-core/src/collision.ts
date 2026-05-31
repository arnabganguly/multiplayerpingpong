import { BallState, GameState, PaddleState, PlayerSide } from "./entities";
import { DEFAULT_PADDLE_WIDTH } from "./constants";
import {
  isBeyondLeftBoundary,
  isBeyondRightBoundary,
  keepBallWithinVerticalBounds
} from "./physics";
import { withRallySpeed } from "./difficulty";

const LEFT_PADDLE_X = 0.055;
const RIGHT_PADDLE_X = 0.945;

export interface CollisionResult {
  state: GameState;
  scoringSide?: PlayerSide;
  paddleHit?: PlayerSide;
}

const overlapsPaddle = (ball: BallState, paddle: PaddleState): boolean =>
  ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;

const bounceFromPaddle = (
  ball: BallState,
  paddle: PaddleState,
  side: PlayerSide,
  rallyCount: number
): BallState => {
  const paddleCenter = paddle.y + paddle.height / 2;
  const offset = (ball.y - paddleCenter) / (paddle.height / 2);
  const direction = side === "left" ? 1 : -1;
  const nextBall = withRallySpeed(
    {
      ...ball,
      x:
        side === "left"
          ? LEFT_PADDLE_X + DEFAULT_PADDLE_WIDTH + ball.radius
          : RIGHT_PADDLE_X - ball.radius,
      vx: Math.abs(ball.vx) * direction,
      vy: ball.speed * offset * 0.65
    },
    rallyCount
  );
  return nextBall;
};

export const resolveCollisions = (state: GameState): CollisionResult => {
  let ball = keepBallWithinVerticalBounds(state.ball);
  let rallyCount = state.rallyCount;
  let paddleHit: PlayerSide | undefined;

  const leftPaddle = state.paddles.left;
  const rightPaddle = state.paddles.right;

  if (
    ball.vx < 0 &&
    ball.x - ball.radius <= LEFT_PADDLE_X + leftPaddle.width &&
    overlapsPaddle(ball, leftPaddle)
  ) {
    rallyCount += 1;
    paddleHit = "left";
    ball = bounceFromPaddle(ball, leftPaddle, "left", rallyCount);
  }

  if (
    ball.vx > 0 &&
    ball.x + ball.radius >= RIGHT_PADDLE_X - rightPaddle.width &&
    overlapsPaddle(ball, rightPaddle)
  ) {
    rallyCount += 1;
    paddleHit = "right";
    ball = bounceFromPaddle(ball, rightPaddle, "right", rallyCount);
  }

  if (isBeyondLeftBoundary(ball)) {
    return {
      state: { ...state, ball, rallyCount },
      scoringSide: "right"
    };
  }

  if (isBeyondRightBoundary(ball)) {
    return {
      state: { ...state, ball, rallyCount },
      scoringSide: "left"
    };
  }

  return {
    state: { ...state, ball, rallyCount },
    paddleHit
  };
};
