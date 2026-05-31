import { useEffect, useState } from "react";
import { PaddleCommand, PaddleCommands } from "@pingpong/game-core";

export const resolveLocalKeyboardCommands = (keys: Set<string>): PaddleCommands => {
  const left: PaddleCommand = keys.has("KeyW")
    ? { intent: "up" }
    : keys.has("KeyS")
      ? { intent: "down" }
      : { intent: "stop" };
  const right: PaddleCommand = keys.has("ArrowUp")
    ? { intent: "up" }
    : keys.has("ArrowDown")
      ? { intent: "down" }
      : { intent: "stop" };

  return { left, right };
};

export const useLocalTwoPlayerKeyboard = () => {
  const [commands, setCommands] = useState<PaddleCommands>({
    left: { intent: "stop" },
    right: { intent: "stop" }
  });

  useEffect(() => {
    const pressed = new Set<string>();
    const handled = ["KeyW", "KeyS", "ArrowUp", "ArrowDown"];
    const update = () => setCommands(resolveLocalKeyboardCommands(pressed));

    const onDown = (event: KeyboardEvent) => {
      if (handled.includes(event.code)) {
        event.preventDefault();
        pressed.add(event.code);
        update();
      }
    };
    const onUp = (event: KeyboardEvent) => {
      if (handled.includes(event.code)) {
        pressed.delete(event.code);
        update();
      }
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return commands;
};
