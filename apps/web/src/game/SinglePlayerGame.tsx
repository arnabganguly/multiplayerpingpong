import { useEffect, useRef, useState } from "react";
import {
  advanceLocalMatch,
  chooseAiPaddleIntent,
  createLocalMatch,
  LocalMatch,
  pauseLocalMatch,
  resumeLocalMatch,
  restartLocalMatch
} from "@pingpong/game-core";
import { useKeyboardControls } from "../controls/useKeyboardControls";
import { useTouchControls } from "../controls/useTouchControls";
import { CourtCanvas } from "./CourtCanvas";
import { GameHud } from "../hud/GameHud";
import { useFrameMetrics } from "./useFrameMetrics";

export interface SinglePlayerGameProps {
  onExit: () => void;
}

export function SinglePlayerGame({ onExit }: SinglePlayerGameProps) {
  const [match, setMatch] = useState<LocalMatch>(() => createLocalMatch("single_player_ai"));
  const keyboardCommand = useKeyboardControls();
  const touchControls = useTouchControls();
  const { metrics, recordFrame } = useFrameMetrics();
  const lastFrame = useRef<number | undefined>();

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const previous = lastFrame.current ?? now;
      const delta = Math.min(0.033, (now - previous) / 1000);
      lastFrame.current = now;
      recordFrame(now);
      setMatch((current) => {
        const ai = chooseAiPaddleIntent(current.state.paddles.right, current.state.ball.y, {
          difficultyLevel: current.state.difficultyLevel
        });
        return advanceLocalMatch(current, delta, {
          left: touchControls.command.intent !== "stop" ? touchControls.command : keyboardCommand,
          right: ai
        });
      });
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [keyboardCommand, touchControls.command, recordFrame]);

  return (
    <section className="game-screen" aria-label="Single-player match">
      <GameHud
        score={match.state.score}
        status={match.state.status}
        servingSide={match.state.servingSide}
        winner={match.winner}
        fps={metrics.fps}
        onPause={() => setMatch((current) => pauseLocalMatch(current))}
        onResume={() => setMatch((current) => resumeLocalMatch(current))}
        onRestart={() => setMatch((current) => restartLocalMatch(current))}
        onExit={onExit}
      />
      <CourtCanvas state={match.state} />
      <div className="touch-controls" aria-label="Touch controls">
        <button
          onPointerDown={touchControls.touchProps.startUp}
          onPointerUp={touchControls.touchProps.stop}
          onPointerCancel={touchControls.touchProps.stop}
        >
          Up
        </button>
        <button
          onPointerDown={touchControls.touchProps.startDown}
          onPointerUp={touchControls.touchProps.stop}
          onPointerCancel={touchControls.touchProps.stop}
        >
          Down
        </button>
      </div>
    </section>
  );
}
