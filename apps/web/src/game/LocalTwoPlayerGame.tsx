import { useEffect, useRef, useState } from "react";
import {
  advanceLocalMatch,
  createLocalMatch,
  LocalMatch,
  PaddleCommand,
  PaddleCommands,
  pauseLocalMatch,
  PlayerSide,
  resumeLocalMatch,
  restartLocalMatch
} from "@pingpong/game-core";
import { useLocalTwoPlayerKeyboard } from "../controls/useLocalTwoPlayerKeyboard";
import { LocalTouchControls } from "../controls/LocalTouchControls";
import { CourtCanvas } from "./CourtCanvas";
import { GameHud } from "../hud/GameHud";
import { useFrameMetrics } from "./useFrameMetrics";

export interface LocalTwoPlayerGameProps {
  onExit: () => void;
}

const mergeCommands = (keyboard: PaddleCommands, touch: PaddleCommands): PaddleCommands => ({
  left: touch.left?.intent !== "stop" ? touch.left : keyboard.left,
  right: touch.right?.intent !== "stop" ? touch.right : keyboard.right
});

export function LocalTwoPlayerGame({ onExit }: LocalTwoPlayerGameProps) {
  const [match, setMatch] = useState<LocalMatch>(() => createLocalMatch("local_two_player"));
  const keyboard = useLocalTwoPlayerKeyboard();
  const [touch, setTouch] = useState<PaddleCommands>({
    left: { intent: "stop" },
    right: { intent: "stop" }
  });
  const { metrics, recordFrame } = useFrameMetrics();
  const lastFrame = useRef<number | undefined>();

  const setTouchCommand = (side: PlayerSide, command: PaddleCommand) => {
    setTouch((current) => ({ ...current, [side]: command }));
  };

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const previous = lastFrame.current ?? now;
      const delta = Math.min(0.033, (now - previous) / 1000);
      lastFrame.current = now;
      recordFrame(now);
      setMatch((current) => advanceLocalMatch(current, delta, mergeCommands(keyboard, touch)));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [keyboard, touch, recordFrame]);

  return (
    <section className="game-screen" aria-label="Local two-player match">
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
      <CourtCanvas state={match.state} label="Local two-player Ping Pong court" />
      <LocalTouchControls onCommand={setTouchCommand} />
    </section>
  );
}
