export interface BrowserPerformanceSnapshot {
  startupMs: number;
  frameFps?: number;
  inputLatencyMs?: number;
}

const startedAt = performance.now();
const inputSamples: number[] = [];

export const recordInputLatency = (started: number) => {
  inputSamples.push(performance.now() - started);
  if (inputSamples.length > 100) {
    inputSamples.shift();
  }
};

export const getBrowserPerformanceSnapshot = (frameFps?: number): BrowserPerformanceSnapshot => {
  const sorted = [...inputSamples].sort((a, b) => a - b);
  return {
    startupMs: Math.round(performance.now() - startedAt),
    frameFps,
    inputLatencyMs: sorted[Math.floor(sorted.length * 0.95)]
  };
};
