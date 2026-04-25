import type { DequeueResult, Message } from '../core/types';

export interface IBroker {
  enqueueMessage<T>(queueName: string, clientId: string, message: Message<T>): Promise<void>;
  dequeueMessage<T>(queueName: string, clientId: string): Promise<DequeueResult<T>>;
  hasMessages(queueName: string, clientId: string): Promise<boolean>;
  isClientActive(queueName: string, clientId: string): Promise<boolean>;
  getQueueDepth(queueName: string, clientId: string): Promise<number>;
}
