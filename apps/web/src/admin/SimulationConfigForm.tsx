import { FormEvent, useMemo, useState } from "react";
import {
  SIMULATION_BEHAVIOR_PROFILES,
  SimulationBehaviorProfile,
  SimulationStartRequest,
  SimulatorStatusResponse
} from "@pingpong/contracts";

interface SimulationConfigFormProps {
  disabled: boolean;
  limits?: SimulatorStatusResponse["limits"];
  error?: string;
  onStart: (configuration: SimulationStartRequest) => Promise<void>;
}

const defaultConfiguration: SimulationStartRequest = {
  virtualPlayers: 100,
  matches: 50,
  durationSeconds: 300,
  behaviorProfile: "balanced",
  updateFrequencyHz: 10,
  disconnectRatePerMinute: 0,
  reconnectRatePerMinute: 0
};

const numberValue = (value: FormDataEntryValue | null) => Number(value ?? 0);

export function SimulationConfigForm({
  disabled,
  limits,
  error,
  onStart
}: SimulationConfigFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const maxPlayers = limits?.maxVirtualPlayers ?? 1000;
  const maxDuration = limits?.maxDurationSeconds ?? 1800;
  const maxFrequency = limits?.maxUpdateFrequencyHz ?? 20;

  const profileOptions = useMemo(() => SIMULATION_BEHAVIOR_PROFILES, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const configuration: SimulationStartRequest = {
      virtualPlayers: numberValue(form.get("virtualPlayers")),
      matches: numberValue(form.get("matches")),
      durationSeconds: numberValue(form.get("durationSeconds")),
      behaviorProfile: String(form.get("behaviorProfile")) as SimulationBehaviorProfile,
      updateFrequencyHz: numberValue(form.get("updateFrequencyHz")),
      disconnectRatePerMinute: numberValue(form.get("disconnectRatePerMinute")),
      reconnectRatePerMinute: numberValue(form.get("reconnectRatePerMinute")),
      seed: String(form.get("seed") ?? "").trim() || undefined
    };

    if (configuration.matches > Math.ceil(configuration.virtualPlayers / 2)) {
      setFormError("Matches cannot exceed half the virtual player count.");
      return;
    }

    setSubmitting(true);
    setFormError(undefined);
    try {
      await onStart(configuration);
    } catch (startError) {
      setFormError(startError instanceof Error ? startError.message : "Simulation start failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="simulation-form" onSubmit={submit} aria-label="Simulation configuration">
      <div className="form-grid">
        <label>
          <span>Virtual players</span>
          <input
            name="virtualPlayers"
            type="number"
            min={1}
            max={maxPlayers}
            defaultValue={defaultConfiguration.virtualPlayers}
            disabled={disabled || submitting}
            required
          />
        </label>
        <label>
          <span>Matches</span>
          <input
            name="matches"
            type="number"
            min={1}
            max={Math.ceil(maxPlayers / 2)}
            defaultValue={defaultConfiguration.matches}
            disabled={disabled || submitting}
            required
          />
        </label>
        <label>
          <span>Duration seconds</span>
          <input
            name="durationSeconds"
            type="number"
            min={30}
            max={maxDuration}
            defaultValue={defaultConfiguration.durationSeconds}
            disabled={disabled || submitting}
            required
          />
        </label>
        <label>
          <span>Behavior profile</span>
          <select
            name="behaviorProfile"
            defaultValue={defaultConfiguration.behaviorProfile}
            disabled={disabled || submitting}
          >
            {profileOptions.map((profile) => (
              <option key={profile} value={profile}>
                {profile}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Update frequency Hz</span>
          <input
            name="updateFrequencyHz"
            type="number"
            min={0.1}
            max={maxFrequency}
            step={0.1}
            defaultValue={defaultConfiguration.updateFrequencyHz}
            disabled={disabled || submitting}
            required
          />
        </label>
        <label>
          <span>Disconnects per min</span>
          <input
            name="disconnectRatePerMinute"
            type="number"
            min={0}
            max={100}
            step={0.1}
            defaultValue={defaultConfiguration.disconnectRatePerMinute}
            disabled={disabled || submitting}
            required
          />
        </label>
        <label>
          <span>Reconnects per min</span>
          <input
            name="reconnectRatePerMinute"
            type="number"
            min={0}
            max={100}
            step={0.1}
            defaultValue={defaultConfiguration.reconnectRatePerMinute}
            disabled={disabled || submitting}
            required
          />
        </label>
        <label>
          <span>Seed</span>
          <input name="seed" type="text" disabled={disabled || submitting} />
        </label>
      </div>
      {(formError || error) && (
        <p className="error-text" role="alert">
          {formError ?? error}
        </p>
      )}
      <button type="submit" disabled={disabled || submitting}>
        {submitting ? "Starting..." : "Start Simulation"}
      </button>
    </form>
  );
}
