import { useEffect, useState } from "react";
import type { SimulationStartRequest } from "@pingpong/contracts";
import type { WebConfig } from "../app/config";
import { AdminAccessGate } from "./AdminAccessGate";
import { SimulationConfigForm } from "./SimulationConfigForm";
import { SimulationStatusDashboard } from "./SimulationStatusDashboard";
import { startSimulation, stopSimulation } from "./simulationApi";
import { useSimulationPolling } from "./useSimulationPolling";

interface SimulationControlPanelProps {
  config: WebConfig;
  onExit: () => void;
}

const storageKey = "pingpong.simulator.adminToken";

export function SimulationControlPanel({ config, onExit }: SimulationControlPanelProps) {
  const [token, setToken] = useState(() => window.localStorage.getItem(storageKey) ?? "");
  const [actionError, setActionError] = useState<string | undefined>();
  const [stopping, setStopping] = useState(false);
  const { status, loading, error, refresh } = useSimulationPolling(
    config.publicSimulatorApiUrl,
    token
  );

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(storageKey, token);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [token]);

  const start = async (configuration: SimulationStartRequest) => {
    setActionError(undefined);
    await startSimulation(config.publicSimulatorApiUrl, token, configuration);
    await refresh();
  };

  const stop = async () => {
    setStopping(true);
    setActionError(undefined);
    try {
      await stopSimulation(config.publicSimulatorApiUrl, token);
      await refresh();
    } catch (stopError) {
      setActionError(stopError instanceof Error ? stopError.message : "Stop request failed.");
    } finally {
      setStopping(false);
    }
  };

  return (
    <section className="admin-panel" aria-labelledby="admin-title">
      <div className="topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 id="admin-title">Load Testing</h1>
        </div>
        <div className="admin-actions">
          {token && (
            <button className="ghost-button" type="button" onClick={() => setToken("")}>
              Lock
            </button>
          )}
          <button className="ghost-button" type="button" onClick={onExit}>
            Back
          </button>
        </div>
      </div>

      <AdminAccessGate token={token} onTokenChange={setToken}>
        <div className="admin-grid">
          <SimulationConfigForm
            disabled={!status?.enabled || Boolean(status?.activeRun)}
            limits={status?.limits}
            error={actionError}
            onStart={start}
          />
          <SimulationStatusDashboard
            status={status}
            loading={loading}
            error={error}
            onStop={stop}
            stopping={stopping}
          />
        </div>
      </AdminAccessGate>
    </section>
  );
}
