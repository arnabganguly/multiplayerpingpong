import { FormEvent, ReactNode, useState } from "react";

interface AdminAccessGateProps {
  token: string;
  onTokenChange: (token: string) => void;
  children: ReactNode;
}

export function AdminAccessGate({ token, onTokenChange, children }: AdminAccessGateProps) {
  const [draftToken, setDraftToken] = useState(token);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onTokenChange(draftToken.trim());
  };

  if (token) {
    return <>{children}</>;
  }

  return (
    <form className="admin-access" onSubmit={submit} aria-label="Administrator access">
      <label>
        <span>Administrator token</span>
        <input
          type="password"
          autoComplete="current-password"
          value={draftToken}
          onChange={(event) => setDraftToken(event.target.value)}
          required
        />
      </label>
      <button type="submit">Unlock Load Testing</button>
    </form>
  );
}
