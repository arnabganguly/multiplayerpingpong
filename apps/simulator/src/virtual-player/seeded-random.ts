export class SeededRandom {
  private state: number;

  constructor(seed: string | undefined) {
    this.state = this.hash(seed ?? `${Date.now()}`);
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0xffffffff;
  }

  between(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  private hash(value: string): number {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
}
