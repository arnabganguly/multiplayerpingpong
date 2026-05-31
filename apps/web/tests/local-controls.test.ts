import { describe, expect, it } from "vitest";
import { resolveLocalKeyboardCommands } from "../src/controls/useLocalTwoPlayerKeyboard";

describe("local two-player keyboard controls", () => {
  it("maps independent left and right paddle controls", () => {
    const commands = resolveLocalKeyboardCommands(new Set(["KeyW", "ArrowDown"]));
    expect(commands.left?.intent).toBe("up");
    expect(commands.right?.intent).toBe("down");
  });

  it("stops each paddle independently when keys are absent", () => {
    const commands = resolveLocalKeyboardCommands(new Set(["ArrowUp"]));
    expect(commands.left?.intent).toBe("stop");
    expect(commands.right?.intent).toBe("up");
  });
});
