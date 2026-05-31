import { MatchStatus, PlayerSide } from "@pingpong/contracts";
import { Score } from "@pingpong/game-core";

export interface GameHudProps {
  score: Score;
  status: MatchStatus;
  servingSide: PlayerSide;
  winner?: PlayerSide;
  fps?: number;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function GameHud({
  score,
  status,
  servingSide,
  winner,
  fps,
  onPause,
  onResume,
  onRestart,
  onExit
}: GameHudProps) {
  const paused = status === "paused";
  const ended = status === "match_ended";

  return (
    <section className="game-hud" aria-label="Match status">
      <div className="scoreboard" aria-live="polite">
        <span>Left {score.left}</span>
        <strong>{status.replace("_", " ")}</strong>
        <span>Right {score.right}</span>
      </div>
      <p className="match-message" aria-live="polite">
        {ended && winner ? `${winner} wins` : `Serving side: ${servingSide}`}
        {fps ? ` · ${fps} fps` : ""}
      </p>
      <div className="hud-actions">
        <button aria-pressed={paused} onClick={paused ? onResume : onPause} disabled={ended}>
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={onRestart} aria-label="Restart match">
          Restart
        </button>
        <button className="ghost-button" onClick={onExit} aria-label="Exit match">
          Exit
        </button>
      </div>
    </section>
  );
}
