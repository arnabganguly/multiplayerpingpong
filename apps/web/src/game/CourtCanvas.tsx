import { useEffect, useRef } from "react";
import { GameState } from "@pingpong/game-core";
import { useCourtLayout } from "./useCourtLayout";

export interface CourtCanvasProps {
  state: GameState;
  label?: string;
}

export function CourtCanvas({ state, label = "Ping Pong court" }: CourtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layout = useCourtLayout();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#1f6f4a";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#f5f0e8";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, width - 16, height - 16);
    ctx.setLineDash([12, 14]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 14);
    ctx.lineTo(width / 2, height - 14);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawPaddle = (side: "left" | "right") => {
      const paddle = state.paddles[side];
      const x = side === "left" ? width * 0.055 : width * 0.945 - width * paddle.width;
      ctx.fillStyle = side === "left" ? "#f7c548" : "#f5f0e8";
      ctx.fillRect(x, paddle.y * height, width * paddle.width, paddle.height * height);
    };

    drawPaddle("left");
    drawPaddle("right");

    ctx.beginPath();
    ctx.fillStyle = "#ff6b4a";
    ctx.arc(state.ball.x * width, state.ball.y * height, state.ball.radius * width, 0, Math.PI * 2);
    ctx.fill();
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      className="court-canvas"
      style={{ aspectRatio: layout.aspectRatio }}
      width={960}
      height={540}
      role="img"
      aria-label={label}
    />
  );
}
