import {
  BallState,
  GameState,
  PaddleIntent,
  PaddleState,
  PlayerSide,
  Score
} from "@pingpong/contracts";
import {
  DEFAULT_BALL_RADIUS,
  DEFAULT_BALL_SPEED,
  DEFAULT_PADDLE_HEIGHT,
  DEFAULT_PADDLE_WIDTH
} from "./constants";

export type { BallState, GameState, PaddleIntent, PaddleState, PlayerSide, Score };

export const createInitialBall = (servingSide: PlayerSide = "left"): BallState => {
  const direction = servingSide === "left" ? 1 : -1;
  return {
    x: 0.5,
    y: 0.5,
    vx: direction * DEFAULT_BALL_SPEED,
    vy: DEFAULT_BALL_SPEED * 0.24,
    radius: DEFAULT_BALL_RADIUS,
    speed: DEFAULT_BALL_SPEED
  };
};

export const createInitialPaddle = (): PaddleState => ({
  y: 0.5 - DEFAULT_PADDLE_HEIGHT / 2,
  height: DEFAULT_PADDLE_HEIGHT,
  width: DEFAULT_PADDLE_WIDTH,
  velocity: 0,
  intent: "stop"
});

export const createInitialGameState = (
  overrides: Partial<GameState> = {},
  now = new Date().toISOString()
): GameState => {
  const servingSide = overrides.servingSide ?? "left";
  return {
    sequence: overrides.sequence ?? 0,
    serverTime: overrides.serverTime ?? now,
    status: overrides.status ?? "serving",
    ball: overrides.ball ?? createInitialBall(servingSide),
    paddles: overrides.paddles ?? {
      left: createInitialPaddle(),
      right: createInitialPaddle()
    },
    score: overrides.score ?? { left: 0, right: 0 },
    servingSide,
    rallyCount: overrides.rallyCount ?? 0,
    difficultyLevel: overrides.difficultyLevel ?? 1,
    lastPoint: overrides.lastPoint
  };
};

export const oppositeSide = (side: PlayerSide): PlayerSide => (side === "left" ? "right" : "left");
