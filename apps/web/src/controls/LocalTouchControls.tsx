import { PaddleCommand, PlayerSide } from "@pingpong/game-core";

export interface LocalTouchControlsProps {
  onCommand: (side: PlayerSide, command: PaddleCommand) => void;
}

export function LocalTouchControls({ onCommand }: LocalTouchControlsProps) {
  const control = (side: PlayerSide, intent: PaddleCommand["intent"], label: string) => (
    <button
      onPointerDown={() => onCommand(side, { intent })}
      onPointerUp={() => onCommand(side, { intent: "stop" })}
      onPointerCancel={() => onCommand(side, { intent: "stop" })}
      aria-label={`${side} paddle ${label}`}
      className="touch-button"
    >
      {label}
    </button>
  );

  return (
    <div className="local-touch-controls" aria-label="Local touch controls">
      <div className="touch-zone">
        <span>Left</span>
        {control("left", "up", "Up")}
        {control("left", "down", "Down")}
      </div>
      <div className="touch-zone">
        <span>Right</span>
        {control("right", "up", "Up")}
        {control("right", "down", "Down")}
      </div>
    </div>
  );
}
