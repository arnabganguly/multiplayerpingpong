import { RealtimeClient } from "./realtime-client";

export class WebSocketClientPool {
  private readonly clients = new Set<RealtimeClient>();

  add(client: RealtimeClient): void {
    this.clients.add(client);
  }

  remove(client: RealtimeClient): void {
    this.clients.delete(client);
  }

  count(): number {
    return this.clients.size;
  }

  closeAll(): void {
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();
  }
}
