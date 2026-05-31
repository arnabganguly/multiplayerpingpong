import { PaddleIntent, PaddleState } from "./entities";

export interface AiOptions {
  difficultyLevel: number;
  imperfection?: number;
}

export interface AiDecision {
  intent: PaddleIntent;
  targetY?: number;
}

export const chooseAiPaddleIntent = (
  paddle: PaddleState,
  ballY: number,
  options: AiOptions
): AiDecision => {
  const imperfection = options.imperfection ?? 0.04;
  const difficultyOffset = Math.max(0, 0.09 - options.difficultyLevel * 0.012);
  const targetY = Math.min(1, Math.max(0, ballY + imperfection - difficultyOffset));
  const paddleCenter = paddle.y + paddle.height / 2;

  if (Math.abs(targetY - paddleCenter) < 0.015) {
    return { intent: "stop" };
  }

  return {
    intent: "target",
    targetY
  };
};
