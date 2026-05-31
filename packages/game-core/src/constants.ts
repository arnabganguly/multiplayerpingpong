export const COURT_WIDTH = 1;
export const COURT_HEIGHT = 1;
export const DEFAULT_TARGET_SCORE = 11;
export const DEFAULT_WIN_BY = 2;
export const DEFAULT_TICK_RATE = 30;
export const DEFAULT_PADDLE_HEIGHT = 0.18;
export const DEFAULT_PADDLE_WIDTH = 0.025;
export const DEFAULT_BALL_RADIUS = 0.018;
export const DEFAULT_BALL_SPEED = 0.42;
export const MAX_BALL_SPEED = 2;
export const PADDLE_SPEED = 0.82;
export const SERVE_COUNTDOWN_MS = 900;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
