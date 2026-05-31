const baseUrl = process.env.PINGPONG_API_URL ?? "http://localhost:8080/api";

const create = async () => {
  const response = await fetch(`${baseUrl}/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ clientProtocolVersion: "1.0" })
  });
  if (!response.ok) {
    throw new Error(`create session failed: ${response.status}`);
  }
  return (await response.json()) as { sessionId: string; joinCode: string };
};

const session = await create();
const badJoin = await fetch(`${baseUrl}/sessions/${session.sessionId}/join`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ joinCode: "WRONG", clientProtocolVersion: "1.0" })
});

console.log(JSON.stringify({ invalidJoinStatus: badJoin.status }, null, 2));
if (badJoin.status < 400) {
  throw new Error("Invalid join unexpectedly succeeded.");
}
