import { describe, expect, it } from "vitest";
import { addPoint, getWinner, nextServingSide } from "../src";

describe("scoring rules", () => {
  it("increments only the scoring side", () => {
    expect(addPoint({ left: 1, right: 2 }, "left")).toEqual({ left: 2, right: 2 });
  });

  it("requires target score and win-by margin", () => {
    expect(getWinner({ left: 11, right: 10 })).toBeUndefined();
    expect(getWinner({ left: 12, right: 10 })).toBe("left");
  });

  it("rotates serve to the side that conceded the point", () => {
    expect(nextServingSide("left")).toBe("right");
  });
});
