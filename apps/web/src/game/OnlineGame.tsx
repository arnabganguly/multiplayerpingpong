import { useEffect, useMemo, useState } from "react";
import { createInitialGameState, GameState } from "@pingpong/game-core";
import { RealtimeEnvelope } from "@pingpong/contracts";
import { RealtimeClient } from "../realtime/realtimeClient";
import { OnlineCredentials } from "./OnlineLobby";
import { CourtCanvas } from "./CourtCanvas";
import { GameHud } from "../hud/GameHud";

export interface OnlineGameProps {
  credentials: OnlineCredentials;
  onExit: () => void;
}

interface SnapshotMessagePayload {
  status: GameState["status"];
  score: GameState["score"];
  servingSide: GameState["servingSide"];
  ball: Partial<GameState["ball"]>;
  paddles: {
    left: Partial<GameState["paddles"]["left"]>;
    right: Partial<GameState["paddles"]["right"]>;
  };
  rallyCount: number;
}

export function OnlineGame({ credentials, onExit }: OnlineGameProps) {
  const [state, setState] = useState<GameState>(() =>
    createInitialGameState({ status: "waiting" })
  );
  const [connection, setConnection] = useState("connecting");
  const client = useMemo(
    () =>
      new RealtimeClient(
        {
          websocketUrl: credentials.websocketUrl,
          sessionId: credentials.sessionId,
          playerId: credentials.playerId,
          playerToken: credentials.playerToken
        },
        (event: RealtimeEnvelope) => {
          if (event.type === "state.snapshot") {
            const payload = event.payload as SnapshotMessagePayload;
            setState((current) => ({
              ...current,
              sequence: event.sequence,
              serverTime: event.timestamp,
              status: payload.status,
              score: payload.score,
              servingSide: payload.servingSide,
              ball: { ...current.ball, ...payload.ball, radius: current.ball.radius },
              paddles: {
                left: { ...current.paddles.left, ...payload.paddles.left },
                right: { ...current.paddles.right, ...payload.paddles.right }
              },
              rallyCount: payload.rallyCount
            }));
          }
        },
        setConnection
      ),
    [credentials]
  );

  useEffect(() => {
    client.connect();
    return () => client.close();
  }, [client]);

  return (
    <section className="game-screen" aria-label="Online match">
      <GameHud
        score={state.score}
        status={state.status}
        servingSide={state.servingSide}
        onPause={() => client.send("match.pause", { playerToken: credentials.playerToken })}
        onResume={() => client.send("match.resume", { playerToken: credentials.playerToken })}
        onRestart={() =>
          client.send("match.restart", { intent: "request", playerToken: credentials.playerToken })
        }
        onExit={onExit}
      />
      <p className="match-message" aria-live="polite">
        {connection}
      </p>
      <CourtCanvas state={state} label="Online Ping Pong court" />
      <div className="touch-controls" aria-label="Online touch controls">
        <button onPointerDown={() => client.paddle("up")} onPointerUp={() => client.paddle("stop")}>
          Up
        </button>
        <button
          onPointerDown={() => client.paddle("down")}
          onPointerUp={() => client.paddle("stop")}
        >
          Down
        </button>
      </div>
    </section>
  );
}
