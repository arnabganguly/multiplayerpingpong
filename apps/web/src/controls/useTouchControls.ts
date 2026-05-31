import { useCallback, useState } from "react";
import { PaddleCommand } from "@pingpong/game-core";

export const useTouchControls = () => {
  const [command, setCommand] = useState<PaddleCommand>({ intent: "stop" });

  const startUp = useCallback(() => setCommand({ intent: "up" }), []);
  const startDown = useCallback(() => setCommand({ intent: "down" }), []);
  const stop = useCallback(() => setCommand({ intent: "stop" }), []);

  return {
    command,
    touchProps: {
      startUp,
      startDown,
      stop
    }
  };
};
