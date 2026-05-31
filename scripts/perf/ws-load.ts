import WebSocket from "ws";

const url = process.env.PINGPONG_WS_URL ?? "ws://localhost:8080/ws";
const connections = Number(process.env.PINGPONG_LOAD_CONNECTIONS ?? 200);
const timeoutMs = Number(process.env.PINGPONG_LOAD_TIMEOUT_MS ?? 10000);

let opened = 0;
let failed = 0;

await Promise.all(
  Array.from(
    { length: connections },
    () =>
      new Promise<void>((resolve) => {
        const socket = new WebSocket(url);
        const timeout = setTimeout(() => {
          failed += 1;
          socket.close();
          resolve();
        }, timeoutMs);
        socket.once("open", () => {
          opened += 1;
          clearTimeout(timeout);
          socket.close();
          resolve();
        });
        socket.once("error", () => {
          failed += 1;
          clearTimeout(timeout);
          resolve();
        });
      })
  )
);

console.log(JSON.stringify({ url, attempted: connections, opened, failed }, null, 2));
if (failed > 0) {
  process.exitCode = 1;
}
