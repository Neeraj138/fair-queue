import type { DequeueResult, Message } from '../../core/types';
import type { IBroker } from '../broker.interface';

export class MemoryBroker implements IBroker {
  private queues: Map<string, Map<string, Message<unknown>[]>> = new Map();

  private getOrCreateClientMap(queueName: string): Map<string, Message<unknown>[]> {
    let clientMap = this.queues.get(queueName);
    if (!clientMap) {
      clientMap = new Map<string, Message<unknown>[]>();
      this.queues.set(queueName, clientMap);
    }
    return clientMap;
  }

  private getOrCreateMsgQ(queueName: string, clientId: string): Message<unknown>[] {
    let clientMap = this.getOrCreateClientMap(queueName);
    let queue = clientMap.get(clientId);
    if (!queue) {
      queue = [];
      clientMap.set(clientId, queue);
    }
    return queue;
  }

  private getMsgQ(queueName: string, clientId: string): Message<unknown>[] | undefined {
    let clientMap = this.queues.get(queueName);
    if (!clientMap) return undefined;
    return clientMap.get(clientId);
  }

  async enqueueMessage<T>(queueName: string, clientId: string, message: Message<T>): Promise<void> {
    const msgQ = this.getOrCreateMsgQ(queueName, clientId);
    msgQ.push(message as Message<unknown>);
  }

  async dequeueMessage<T>(queueName: string, clientId: string): Promise<DequeueResult<T>> {
    const msgQ = this.getOrCreateMsgQ(queueName, clientId);
    return (msgQ.shift() as Message<T> | undefined) ?? null;
  }

  async hasMessages(queueName: string, clientId: string): Promise<boolean> {
    return Boolean(this.getMsgQ(queueName, clientId)?.length);
  }

  async isClientActive(queueName: string, clientId: string): Promise<boolean> {
    return this.hasMessages(queueName, clientId);
  }

  async getQueueDepth(queueName: string, clientId: string): Promise<number> {
    return this.getMsgQ(queueName, clientId)?.length ?? 0;
  }
}
