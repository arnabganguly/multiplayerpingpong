import WebSocket from "ws";

const args = new Set(process.argv.slice(2));
const hostArg = process.argv.find((arg) => arg.startsWith("--host="));
const wsArg = process.argv.find((arg) => arg.startsWith("--url="));
const host =
  hostArg?.split("=")[1] ?? process.env.PINGPONG_PUBLIC_URL ?? "https://pingpong.example.com";
const websocketUrl =
  wsArg?.split("=")[1] ?? process.env.PINGPONG_WS_URL ?? host.replace(/^http/, "ws") + "/ws";

const checkHttp = async (path: string) => {
  const response = await fetch(`${host}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
};

const checkWebSocket = () =>
  new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(websocketUrl);
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error("WebSocket smoke check timed out."));
    }, 5000);
    socket.once("open", () => {
      clearTimeout(timeout);
      socket.close();
      resolve();
    });
    socket.once("error", reject);
  });

if (!args.has("--websocket-only")) {
  await checkHttp("/api/health/live");
  await checkHttp("/api/health/ready");
}
await checkWebSocket();
console.log("AKS smoke checks passed.");
