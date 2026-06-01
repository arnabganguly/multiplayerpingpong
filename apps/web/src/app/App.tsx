import { useMemo, useState } from "react";
import { PROTOCOL_VERSION } from "@pingpong/contracts";
import { DEFAULT_TARGET_SCORE } from "@pingpong/game-core";
import { getWebConfig } from "./config";
import { SinglePlayerGame } from "../game/SinglePlayerGame";
import { LocalTwoPlayerGame } from "../game/LocalTwoPlayerGame";
import { OnlineCredentials, OnlineLobby } from "../game/OnlineLobby";
import { OnlineGame } from "../game/OnlineGame";
import { SimulationControlPanel } from "../admin/SimulationControlPanel";

type Mode = "menu" | "single" | "local" | "online" | "admin";

export function App() {
  const [mode, setMode] = useState<Mode>("menu");
  const [onlineCredentials, setOnlineCredentials] = useState<OnlineCredentials | undefined>();
  const config = useMemo(() => getWebConfig(), []);
  const [announcement, setAnnouncement] = useState("Choose a match mode.");

  const chooseMode = (nextMode: Mode) => {
    setMode(nextMode);
    setAnnouncement(
      nextMode === "single"
        ? "Single-player match selected."
        : nextMode === "local"
          ? "Local two-player match selected."
          : nextMode === "online"
            ? "Online lobby selected."
            : nextMode === "admin"
              ? "Admin load testing selected."
              : "Choose a match mode."
    );
  };

  if (mode !== "menu") {
    if (mode === "single") {
      return (
        <main className="app-shell game-app">
          <SinglePlayerGame onExit={() => setMode("menu")} />
        </main>
      );
    }

    if (mode === "local") {
      return (
        <main className="app-shell game-app">
          <LocalTwoPlayerGame onExit={() => setMode("menu")} />
        </main>
      );
    }

    if (mode === "admin") {
      return (
        <main className="app-shell">
          <SimulationControlPanel config={config} onExit={() => chooseMode("menu")} />
        </main>
      );
    }

    return onlineCredentials ? (
      <main className="app-shell game-app">
        <OnlineGame
          credentials={onlineCredentials}
          onExit={() => {
            setOnlineCredentials(undefined);
            chooseMode("menu");
          }}
        />
      </main>
    ) : (
      <main className="app-shell">
        <OnlineLobby
          config={config}
          onReady={setOnlineCredentials}
          onExit={() => {
            setOnlineCredentials(undefined);
            chooseMode("menu");
          }}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="mode-select" aria-labelledby="mode-title">
        <div>
          <p className="eyebrow">Browser Ping Pong</p>
          <h1 id="mode-title">Choose a match</h1>
          <p className="intro-copy">
            First to {DEFAULT_TARGET_SCORE}, protocol {PROTOCOL_VERSION}.
          </p>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        <div className="mode-grid">
          <button className="mode-button" onClick={() => chooseMode("single")}>
            <strong>Single Player</strong>
            <span>Play a full match against AI.</span>
          </button>
          <button className="mode-button" onClick={() => chooseMode("local")}>
            <strong>Local Two-Player</strong>
            <span>Share one keyboard or touch screen.</span>
          </button>
          <button className="mode-button" onClick={() => chooseMode("online")}>
            <strong>Online Two-Player</strong>
            <span>Create or join an invite-only room.</span>
          </button>
          <button className="mode-button" onClick={() => chooseMode("admin")}>
            <strong>Admin</strong>
            <span>Load Testing</span>
          </button>
        </div>
      </section>
    </main>
  );
}
