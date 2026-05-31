import { MatchStatus } from "@pingpong/contracts";

const legalTransitions: Record<MatchStatus, MatchStatus[]> = {
  waiting: ["serving", "restarted"],
  serving: ["in_play", "paused", "reconnecting", "restarted"],
  in_play: ["point_scored", "paused", "reconnecting", "match_ended", "restarted"],
  point_scored: ["serving", "match_ended"],
  paused: ["serving", "in_play", "reconnecting", "restarted"],
  reconnecting: ["serving", "in_play", "match_ended", "restarted"],
  match_ended: ["restarted"],
  restarted: ["serving"]
};

export const canTransition = (from: MatchStatus, to: MatchStatus): boolean =>
  legalTransitions[from].includes(to);

export const transitionStatus = (from: MatchStatus, to: MatchStatus): MatchStatus => {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal match transition: ${from} -> ${to}`);
  }

  return to;
};

export const isActiveStatus = (status: MatchStatus): boolean =>
  status === "serving" || status === "in_play" || status === "point_scored";
