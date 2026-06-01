import { useCallback, useEffect, useState } from "react";
import type { SimulatorStatusResponse } from "@pingpong/contracts";
import { getSimulatorStatus } from "./simulationApi";

export function useSimulationPolling(baseUrl: string, token: string) {
  const [status, setStatus] = useState<SimulatorStatusResponse | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const nextStatus = await getSimulatorStatus(baseUrl, token);
      setStatus(nextStatus);
      setError(undefined);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Status refresh failed.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    if (!token) return;
    void refresh();
    const interval = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(interval);
  }, [refresh, token]);

  return { status, loading, error, refresh };
}
