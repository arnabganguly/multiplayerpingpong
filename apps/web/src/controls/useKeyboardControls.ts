import { useEffect, useState } from "react";
import { PaddleCommand } from "@pingpong/game-core";

const keyToIntent = (keys: Set<string>): PaddleCommand => {
  if (keys.has("ArrowUp") || keys.has("KeyW")) return { intent: "up" };
  if (keys.has("ArrowDown") || keys.has("KeyS")) return { intent: "down" };
  return { intent: "stop" };
};

export const useKeyboardControls = () => {
  const [command, setCommand] = useState<PaddleCommand>({ intent: "stop" });

  useEffect(() => {
    const pressed = new Set<string>();

    const update = () => setCommand(keyToIntent(pressed));
    const onDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(event.code)) {
        event.preventDefault();
        pressed.add(event.code);
        update();
      }
    };
    const onUp = (event: KeyboardEvent) => {
      pressed.delete(event.code);
      update();
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return command;
};
