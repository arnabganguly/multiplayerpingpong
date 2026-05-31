import { PlayerSide, Score } from "@pingpong/contracts";
import { DEFAULT_TARGET_SCORE, DEFAULT_WIN_BY } from "./constants";

export interface WinCondition {
  targetScore: number;
  winBy: number;
}

export const defaultWinCondition: WinCondition = {
  targetScore: DEFAULT_TARGET_SCORE,
  winBy: DEFAULT_WIN_BY
};

export const addPoint = (score: Score, side: PlayerSide): Score => ({
  left: score.left + (side === "left" ? 1 : 0),
  right: score.right + (side === "right" ? 1 : 0)
});

export const getWinner = (
  score: Score,
  condition: WinCondition = defaultWinCondition
): PlayerSide | undefined => {
  const leader = score.left > score.right ? "left" : "right";
  const leaderScore = score[leader];
  const trailerScore = leader === "left" ? score.right : score.left;

  if (leaderScore >= condition.targetScore && leaderScore - trailerScore >= condition.winBy) {
    return leader;
  }

  return undefined;
};

export const nextServingSide = (scoringSide: PlayerSide): PlayerSide =>
  scoringSide === "left" ? "right" : "left";
