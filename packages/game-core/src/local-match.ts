import { MatchMode, PaddleIntent, PlayerSide } from "@pingpong/contracts";
import { createInitialBall, createInitialGameState, GameState, oppositeSide } from "./entities";
import { moveBall, movePaddle } from "./physics";
import { resolveCollisions } from "./collision";
import { addPoint, defaultWinCondition, getWinner, nextServingSide, WinCondition } from "./scoring";
import { transitionStatus } from "./state-machine";

export interface PaddleCommand {
  intent: PaddleIntent;
  targetY?: number;
}

export interface LocalMatch {
  mode: MatchMode;
  state: GameState;
  previousActiveStatus: GameState["status"];
  winner?: PlayerSide;
  winCondition: WinCondition;
}

export type PaddleCommands = Partial<Record<PlayerSide, PaddleCommand>>;

export const createLocalMatch = (
  mode: MatchMode = "single_player_ai",
  winCondition: WinCondition = defaultWinCondition
): LocalMatch => ({
  mode,
  state: createInitialGameState({ status: "serving" }),
  previousActiveStatus: "serving",
  winCondition
});

export const restartLocalMatch = (match: LocalMatch): LocalMatch => ({
  ...createLocalMatch(match.mode, match.winCondition),
  state: {
    ...createInitialGameState({ status: transitionStatus(match.state.status, "restarted") }),
    status: "serving"
  }
});

export const pauseLocalMatch = (match: LocalMatch): LocalMatch => {
  if (match.state.status === "paused" || match.state.status === "match_ended") {
    return match;
  }
  return {
    ...match,
    previousActiveStatus: match.state.status,
    state: { ...match.state, status: transitionStatus(match.state.status, "paused") }
  };
};

export const resumeLocalMatch = (match: LocalMatch): LocalMatch => {
  if (match.state.status !== "paused") {
    return match;
  }
  return {
    ...match,
    state: { ...match.state, status: transitionStatus("paused", match.previousActiveStatus) }
  };
};

export const advanceLocalMatch = (
  match: LocalMatch,
  deltaSeconds: number,
  commands: PaddleCommands = {}
): LocalMatch => {
  if (match.state.status === "paused" || match.state.status === "match_ended") {
    return match;
  }

  if (match.state.status === "point_scored") {
    const state: GameState = {
      ...match.state,
      status: getWinner(match.state.score, match.winCondition) ? "match_ended" : "serving"
    };
    return {
      ...match,
      state,
      winner: getWinner(state.score, match.winCondition)
    };
  }

  let state: GameState = {
    ...match.state,
    sequence: match.state.sequence + 1,
    serverTime: new Date().toISOString(),
    status: match.state.status === "serving" ? "in_play" : match.state.status,
    paddles: {
      left: movePaddle(
        match.state.paddles.left,
        commands.left?.intent ?? "stop",
        deltaSeconds,
        commands.left?.targetY
      ),
      right: movePaddle(
        match.state.paddles.right,
        commands.right?.intent ?? "stop",
        deltaSeconds,
        commands.right?.targetY
      )
    },
    ball: moveBall(match.state.ball, deltaSeconds)
  };

  const collision = resolveCollisions(state);
  state = collision.state;

  if (collision.scoringSide) {
    const score = addPoint(state.score, collision.scoringSide);
    const winner = getWinner(score, match.winCondition);
    const servingSide = nextServingSide(collision.scoringSide);
    state = {
      ...state,
      score,
      status: winner ? "match_ended" : "point_scored",
      servingSide,
      ball: createInitialBall(servingSide),
      rallyCount: 0,
      lastPoint: {
        scoringSide: collision.scoringSide,
        reason: collision.scoringSide === "left" ? "right_boundary" : "left_boundary"
      }
    };
    return { ...match, state, winner };
  }

  if (collision.paddleHit) {
    state = {
      ...state,
      difficultyLevel: Math.max(state.difficultyLevel, Math.floor(state.rallyCount / 4) + 1)
    };
  }

  return { ...match, state };
};

export const commandForSide = (side: PlayerSide, command: PaddleCommand): PaddleCommands => ({
  [side]: command
});

export const opponentSide = oppositeSide;
