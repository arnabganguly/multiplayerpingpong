import { FormEvent, useMemo, useState } from "react";
import { CreateSessionResponse, JoinSessionResponse } from "@pingpong/contracts";
import { WebConfig } from "../app/config";
import { createSessionApi } from "../realtime/sessionApi";

export type OnlineCredentials =
  | CreateSessionResponse
  | (JoinSessionResponse & { joinCode?: string });

export interface OnlineLobbyProps {
  config: WebConfig;
  onReady: (credentials: OnlineCredentials) => void;
  onExit: () => void;
}

export function OnlineLobby({ config, onReady, onExit }: OnlineLobbyProps) {
  const api = useMemo(() => createSessionApi(config.publicApiUrl), [config.publicApiUrl]);
  const [sessionId, setSessionId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [created, setCreated] = useState<CreateSessionResponse | undefined>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await api.createSession();
      setCreated(response);
      onReady(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create session.");
    } finally {
      setBusy(false);
    }
  };

  const join = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await api.joinSession(sessionId.trim(), joinCode.trim());
      onReady({ ...response, joinCode });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join session.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="online-lobby" aria-label="Online lobby">
      <header className="topbar">
        <button className="ghost-button" onClick={onExit}>
          Back
        </button>
        <p className="status-line" aria-live="polite">
          {created ? `Join code ${created.joinCode}` : "Create or join a private room"}
        </p>
      </header>
      <div className="lobby-actions">
        <button onClick={create} disabled={busy}>
          Create online session
        </button>
        {created && (
          <output className="join-output">
            <span>Session: {created.sessionId}</span>
            <span>Code: {created.joinCode}</span>
            <span>{created.joinUrl}</span>
          </output>
        )}
        <form className="join-form" onSubmit={join}>
          <label>
            Session ID
            <input value={sessionId} onChange={(event) => setSessionId(event.target.value)} />
          </label>
          <label>
            Join code
            <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} />
          </label>
          <button disabled={busy || !sessionId || !joinCode}>Join session</button>
        </form>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
