import { useCallback, useRef, useState } from "react";

export interface FrameMetrics {
  fps: number;
  p95FrameMs: number;
  samples: number;
}

export const useFrameMetrics = () => {
  const samplesRef = useRef<number[]>([]);
  const lastFrameRef = useRef<number | undefined>();
  const [metrics, setMetrics] = useState<FrameMetrics>({ fps: 0, p95FrameMs: 0, samples: 0 });

  const recordFrame = useCallback((now: number) => {
    if (lastFrameRef.current !== undefined) {
      const frameMs = now - lastFrameRef.current;
      const samples = [...samplesRef.current.slice(-119), frameMs];
      samplesRef.current = samples;
      const sorted = [...samples].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? frameMs;
      setMetrics({
        fps: Math.round(1000 / (samples.reduce((sum, value) => sum + value, 0) / samples.length)),
        p95FrameMs: Math.round(p95),
        samples: samples.length
      });
    }
    lastFrameRef.current = now;
  }, []);

  return { metrics, recordFrame };
};
