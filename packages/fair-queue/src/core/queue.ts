import type { IBroker } from '../brokers/broker.interface';
import { RoundRobinScheduler } from './scheduler';
import type { DequeueResult } from './types';

export class Queue {
  private readonly broker: IBroker;
  private schedulers = new Map<string, RoundRobinScheduler>();

  constructor(broker: IBroker) {
    this.broker = broker;
  }

  private getOrCreateScheduler(queueName: string) {
    let scheduler = this.schedulers.get(queueName);
    if (!scheduler) {
      scheduler = new RoundRobinScheduler();
      this.schedulers.set(queueName, scheduler);
    }
    return scheduler;
  }

  async publish<T>(
    queueName: string,
    { clientId, payload }: { clientId: string; payload: T },
  ): Promise<void> {
    const scheduler = this.getOrCreateScheduler(queueName);
    const message = {
      id: crypto.randomUUID(),
      clientId,
      payload,
      enqueuedAt: Date.now(),
    };
    await this.broker.enqueueMessage(queueName, clientId, message);

    if (!scheduler.hasClient(clientId)) {
      scheduler.enqueueClient(clientId);
    }

    return;
  }

  async dequeue<T>(queueName: string): Promise<DequeueResult<T>> {
    const scheduler = this.getOrCreateScheduler(queueName);
    const clientId = scheduler.dequeueClient();

    if (clientId == null) {
      return null;
    }
    const message = await this.broker.dequeueMessage<T>(queueName, clientId);

    if (await this.broker.hasMessages(queueName, clientId)) {
      scheduler.enqueueClient(clientId);
    }
    return message;
  }
}
