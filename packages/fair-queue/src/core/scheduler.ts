export class RoundRobinScheduler {
  private queue: string[] = [];
  private clientSet: Set<string> = new Set();

  enqueueClient(clientId: string): boolean {
    if (this.clientSet.has(clientId)) {
      return false;
    }
    this.clientSet.add(clientId);
    this.queue.push(clientId);
    return true;
  }

  dequeueClient(): string | null {
    const clientId = this.queue.shift();
    if (clientId === undefined) {
      return null;
    }
    this.clientSet.delete(clientId);
    return clientId;
  }

  hasClient(clientId: string): boolean {
    return this.clientSet.has(clientId);
  }
}
